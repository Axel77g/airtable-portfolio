import express from "express";
import bcrypt from "bcrypt";
import { makeController } from "./Controller";
import { slugRequest } from "./requests/slugRequest";
import { loginRequest } from "./requests/loginRequest";
import Airtable from "airtable";
import session from "express-session";
//@ts-ignore
import fileStore from "session-file-store";
import { AirtableProjectRepository } from "../airtable/AirtableProjectRepository";
import { AirtableUserRepository } from "../airtable/AirtableUserRepository";
import { AirtableProjectsListingRepository } from "../airtable/AirtableProjectsListingRepository";
import { hidePassword, User } from "../entities/User";
import { PaginatedCollection } from "../types/PaginatedCollection";
import { AirtableResult } from "../airtable/AirtableResult";
import cors from "cors";
import {
  Project,
  ProjectListItem,
  ProjectWithLikedStatus,
} from "../entities/Project";
import { paginatedRequest } from "./requests/paginatedRequest";
import { forceCacheRequest } from "./requests/forceCacheRequest";

declare module "express-session" {
  interface SessionData {
    user?: User;
    likedProjects?: string[];
  }
}

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

const secret = process.env.APP_SECRET || "secret";

if (!apiKey || !baseId)
  throw new Error(
    "Missing Airtable API Key or Base ID. Please set the environment variables AIRTABLE_API_KEY and AIRTABLE_BASE_ID.",
  );

export const app = express();
const base = new Airtable({ apiKey }).base(baseId);

app.use(express.json());

app.use(
  cors({
    //allow all
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

const FileStore = fileStore(session);
app.use(
  session({
    store: new FileStore({
      //persist sessions in a file on the server (prevent session loss on server restart)
      path: "./sessions",
      retries: 0,
    }),
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
);

function authMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  if (isAuth(req)) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}

function isAuth(req: express.Request) {
  return req.session.user !== undefined;
}

function hasLiked(slug: string, req: express.Request) {
  if (!req.session.likedProjects) return false;
  if (!req.session.likedProjects.includes(slug)) return false;
  return true;
}

// ProjectPage Routes
const projectRepository = new AirtableProjectRepository(base);
const projectListRepository = new AirtableProjectsListingRepository(base);

app.get(
  "/projects",
  makeController(async (req, res) => {
    try {
      const { page, pageSize, cache } = req.payload;
      const projects = await projectListRepository.findAll({
        page,
        pageSize,
        withDraft: isAuth(req),
        cache: !isAuth(req) || Boolean(cache),
      });
      //add the liked status
      (
        projects as PaginatedCollection<
          AirtableResult<ProjectWithLikedStatus<ProjectListItem>>
        >
      ).items = projects.items.map((project) => {
        return {
          ...project,
          liked: hasLiked(project.slug, req),
        };
      });
      res.json(projects);
    } catch (e) {
      console.error(e);
      res.status(500).send("une erreur est survenue");
    }
  }, forceCacheRequest.merge(paginatedRequest)),
);

app.get(
  "/projects/:slug",
  makeController(async (req, res) => {
    try {
      const { slug } = req.payload;
      const project = await projectRepository.findBySlug({
        slug,
        withDraft: isAuth(req),
        cache: !isAuth(req),
      });
      if (!project) return res.status(404).send("le projet n'existe pas");
      (project as AirtableResult<ProjectWithLikedStatus<Project>>).liked =
        hasLiked(slug, req);
      res.json(project);
    } catch (e) {
      console.error(e);
      res.status(500).send("une erreur est survenue");
    }
  }, slugRequest),
);

app.post(
  "/projects/:slug/like",
  makeController(async (req, res) => {
    try {
      const { slug } = req.payload;
      const project = projectRepository.likeProject({
        slug,
        dislike: false,
      });
      if (!project) return res.status(404).send("le projet n'existe pas");
      req.session.likedProjects = req.session.likedProjects || [];
      req.session.likedProjects.push(slug);
      res.json(project);
    } catch (e) {
      console.error(e);
      res.status(500).send("une erreur est survenue");
    }
  }, slugRequest),
);

app.post(
  "/projects/:slug/dislike",
  makeController(async (req, res) => {
    try {
      const { slug } = req.payload;
      if (!hasLiked(slug, req))
        return res.status(404).send("vous n'avez jamais aimer ce projet");
      const project = projectRepository.likeProject({
        slug,
        dislike: true,
      });
      if (!project) return res.status(404).send("le projet n'existe pas");
      if (req.session.likedProjects) {
        req.session.likedProjects = req.session.likedProjects.filter(
          (s) => s !== slug,
        );
      }
      res.json(project);
    } catch (e) {
      console.error(e);
      res.status(500).send("une erreur est survenue");
    }
  }, slugRequest),
);

app.post(
  "/projects/:slug/publish",
  authMiddleware,
  makeController(async (req, res) => {
    try {
      const { slug } = req.payload;
      const project = await projectRepository.setPublishProject({
        slug,
        value: true,
        withDraft: isAuth(req),
      });
      if (!project) return res.status(404).send("le projet n'existe pas");
      res.json(project);
    } catch (e) {
      console.error(e);
      res.status(500).send("une erreur est survenue");
    }
  }, slugRequest),
);

app.post(
  "/projects/:slug/unpublish",
  authMiddleware,
  makeController(async (req, res) => {
    try {
      const { slug } = req.payload;
      const project = await projectRepository.setPublishProject({
        slug,
        value: false,
        withDraft: isAuth(req),
      });
      if (!project) return res.status(404).send("le projet n'existe pas");
      res.json(project);
    } catch (e) {
      console.error(e);
      res.status(500).send("une erreur est survenue");
    }
  }, slugRequest),
);

// Auth Routes

const userRepository = new AirtableUserRepository(base);

app.get(
  "/user",
  authMiddleware,
  makeController(async (req, res) => {
    try {
      const user = req.session.user;
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      res.json(hidePassword(user));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "An error occurred during login" });
    }
  }),
);

app.post(
  "/login",
  makeController(async (req, res) => {
    try {
      const { password, email } = req.payload;
      const user = await userRepository.findByEmail({ email });
      if (!user)
        return res.status(401).json({ message: "Invalid credentials" });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        if (!isPasswordValid)
          return res.status(401).json({ message: "Invalid credentials" });

      req.session.user = user;
      res.json(hidePassword(user));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "An error occurred during login" });
    }
  }, loginRequest),
);

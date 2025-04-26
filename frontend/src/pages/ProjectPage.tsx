import {AnimatePresence, motion} from "framer-motion";
import {TextAppear} from "../components/TextAppear.tsx";
import {useLocation, useParams} from "react-router";
import {useProvider} from "../hook/useProvider.ts";
import {ProjectsProvider} from "../providers/ProjectsProvider.ts";
import {useEffect} from "react";
import ReactMarkdown from "react-markdown";

const _project = {
    slug: "mon-projet-super-cool",
    published: true,
    title: "Mon Projet Super Cool",
    like: 128,
    date: new Date("2025-04-20T14:30:00Z"),
    content: `
## Introduction

Ceci est une **description enrichie** de mon projet, avec du texte *Markdown* venant d'Airtable.

* Fonctionnalité 1
* Fonctionnalité 2

### Caractéristiques

1. Première caractéristique
2. Deuxième caractéristique

[Lien vers la documentation](https://example.com)
  `,
    images: [
        {
            filename: "image1.jpg",
            url: "/images/image_1.png",
            thumbnails: {
                small: { url: "https://example.com/images/thumbs/small/image1.jpg" },
                large: { url: "https://example.com/images/thumbs/large/image1.jpg" },
                full: { url: "https://example.com/images/thumbs/full/image1.jpg" },
            },
        },
        {
            filename: "image2.jpg",
            url: "https://example.com/images/image2.jpg",
            thumbnails: {
                small: { url: "https://example.com/images/thumbs/small/image2.jpg" },
                large: { url: "https://example.com/images/thumbs/large/image2.jpg" },
                full: { url: "https://example.com/images/thumbs/full/image2.jpg" },
            },
        },
    ],
    image: {
        filename: "image-principale.jpg",
        url: "/images/image_1.png",
        thumbnails: {
            small: { url: "https://example.com/images/thumbs/small/image-principale.jpg" },
            large: { url: "https://example.com/images/thumbs/large/image-principale.jpg" },
            full: { url: "https://example.com/images/thumbs/full/image-principale.jpg" },
        },
    },
};

function getSlugFromLocation() {
    const location = useLocation();
    const params = useParams();
    return params.slug || location.pathname.split("/").pop();
}

export default function ProjectPage() {
    const slug  = getSlugFromLocation()
    const [response, fetchProject, loading] = useProvider(ProjectsProvider,'getProject', null, true)
    const project = response || null

    useEffect(() => {
        if(slug == null || slug.length == 0) return
        fetchProject(slug)
    },[slug])


    return (
        <AnimatePresence>
            {(!loading && project) && <motion.div className="bg-zinc-900 text-white h-screen overflow-y-auto p-24" key={slug}>
                <div
                >
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="space-y-2">
                                <TextAppear delay={0.8} delayExit={0.2} >
                                    <h1 className="text-5xl">{project.title}</h1>
                                </TextAppear>
                            </div>

                            <div className="text-zinc-400 text-sm">
                                <TextAppear delay={1} delayExit={0} >
                                     <span>
                                         Publié le {new Date(project.date).toLocaleDateString("fr-FR")}
                                     </span>
                                </TextAppear>
                            </div>

                            <motion.div
                                initial={{opacity: 0}}
                                animate={{opacity: 1, transition: {delay: 1.2, duration: 1} }}
                                exit={{opacity: 0, transition: {delay: 0, duration: 0.3} }}
                                className="prose prose-invert markdown-content max-w-none text-zinc-100 mt-12"
                            >
                                <ReactMarkdown>
                                    {project.content}
                                </ReactMarkdown>
                            </motion.div>
                        </div>


                        <motion.div className="space-y-6"
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1, transition: {delay: 1, duration: 1} }}
                                    exit={{opacity: 0, transition: {delay: 0, duration: 0.3} }}
                        >
                            {project.images.map((img, idx) => (
                                <img
                                    src={img.url}
                                    alt={img.filename}
                                    className="transition-transform duration-300"
                                />
                            ))}
                        </motion.div>
                    </div>
                </div>
            </motion.div>}
        </AnimatePresence>

    );
}

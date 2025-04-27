import express from "express";

export function isAuth(req: express.Request) {
  return req.session.user !== undefined;
}
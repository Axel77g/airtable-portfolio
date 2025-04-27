import express from "express";

export function hasLiked(slug: string, req: express.Request) {
  if (!req.session.likedProjects) return false;
  if (!req.session.likedProjects.includes(slug)) return false;
  return true;
}
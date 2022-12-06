import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@calcom/prisma";

import getInstalledAppPath from "../../_utils/getInstalledAppPath";

/**
 * This is an example endpoint for an app, these will run under `/api/integrations/[...args]`
 * @param req
 * @param res
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!req.session?.user?.id) {
    return res.status(401).json({ message: "You must be logged in to do this" });
  }
  const appType = "google_video";
  try {
    const alreadyInstalled = await prisma.credential.findFirst({
      where: {
        type: appType,
        userId: req.session.user.id,
      },
    });
    if (alreadyInstalled) {
      throw new Error("Already installed");
    }
    const installation = await prisma.credential.create({
      data: {
        type: appType,
        key: {},
        userId: req.session.user.id,
        appId: "google-meet",
      },
    });
    console.log("🚀 ~ file: add.ts:35 ~ handler ~ installation", installation);
    if (!installation) {
      throw new Error("Unable to create user credential for google_video");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500);
  }
  return res.status(200).json({ url: getInstalledAppPath({ variant: "conferencing", slug: "google-meet" }) });
}

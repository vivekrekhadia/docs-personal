"use server";

import { parseStringify } from "./../utils";
import { nanoid } from "nanoid";
import { liveblocks } from "../liveblocks";
import { revalidatePath } from "next/cache";

export const createDocument = async ({ userId, email }: CreateDocumentParams) => {
  const roomId = nanoid();
  const metadata = {
    creatorId: userId,
    email: email,
    title: "Untitled",
  };

  const usersAccesses: RoomAccesses = {
    [email]: ["room:write"],
  };

  try {
    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: ["room:write"],
    });

    revalidatePath("/");
    return parseStringify(room);
  } catch (error) {
    console.log(error);
  }
};

export const getDocument = async ({ roomId, userId }: { roomId: string; userId: string }) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    // const hasAccess = Object.keys(room.usersAccesses).includes(userId);
    // if (!hasAccess) {
    //   throw new Error("You don't have access to this Document");
    // }
    return parseStringify(room);
  } catch (error) {
    console.log(error);
  }
};

export const updateDocument = async (roomId: string, title: string) => {
  try {
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      metadata: {
        title,
      },
    });
    revalidatePath("/documents/" + roomId);

    return parseStringify(updatedRoom);
  } catch (error) {
    console.log(error);
  }
};

export const getDocuments = async ({ email }: { email: string }) => {
  try {
    const rooms = await liveblocks.getRooms({ userId: email });

    return parseStringify(rooms);
  } catch (error) {
    console.log(error);
  }
};

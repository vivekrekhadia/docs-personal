"use client";
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense";
import React, { useEffect, useRef, useState } from "react";
import Loader from "./Loader";
import Header from "./Header";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Editor } from "./editor/Editor";
import ActiveCollaborators from "./ActiveCollaborators";
import { Input } from "./ui/input";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { updateDocument } from "@/lib/actions/room.actions";

const CollaborativeRoom = ({ roomId, roomMetadata }: CollaborativeRoomProps) => {
  const currentUserType = "editor";
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [docTitle, setDocTitle] = useState(roomMetadata?.title);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTitle = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setLoading(true);
      try {
        if (docTitle !== roomMetadata?.title) {
          const updatedDoc = await updateDocument(roomId, docTitle);
          if (updatedDoc) {
            setIsEditing(false);
          }
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsEditing(false);
        updateDocument(roomId, docTitle);
      }
      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    };
  }, [roomId, docTitle]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader />}>
        <div className="collaborative-room">
          <Header>
            <div ref={containerRef} className=" flex w-fit items-center justify-center gap-2">
              {isEditing && !loading ? (
                <Input
                  ref={inputRef}
                  type="text"
                  className="document-title-input"
                  placeholder="Enter a title"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  onKeyDown={updateTitle}
                  disabled={loading || !isEditing}
                />
              ) : (
                <p className="document-title">{docTitle}</p>
              )}

              {currentUserType === "editor" && !isEditing && (
                <Image
                  src="/assets/icons/edit.svg"
                  alt="edit"
                  width={24}
                  height={24}
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer"
                />
              )}
              {currentUserType !== "editor" && !isEditing && <p className="view-only-tag">View Only</p>}
              {loading && <p className="text-sm text-gray-400">Saving...</p>}
            </div>
            <div className="flex w-full justify-end flex-1 gap-2 sm:gap-3">
              <ActiveCollaborators />
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </Header>
          <Editor />
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default CollaborativeRoom;

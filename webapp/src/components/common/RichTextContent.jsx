import React from "react";
import { cn } from "@/lib/utils";

export const richTextContentClassName = "rich-text-content";

const defaultEmptyHtml = "";

const RichTextContent = ({ html, emptyHtml = defaultEmptyHtml, className }) => {
  return (
    <div className="mb-8">
      <div
        className={cn(richTextContentClassName, className)}
        dangerouslySetInnerHTML={{ __html: html || emptyHtml }}
      />
    </div>
  );
};

export default RichTextContent;

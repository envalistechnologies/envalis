import React from "react";

export const richTextContentClassName = "rich-text-content";

const RichTextContent = ({ html }) => {
  return (
    <div className="mb-8">
      <div
        className={richTextContentClassName}
        dangerouslySetInnerHTML={{ __html: html || "" }}
      />
    </div>
  );
};

export default RichTextContent;

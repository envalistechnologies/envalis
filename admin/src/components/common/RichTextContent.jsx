import { cn } from "@/lib/utils";

export const richTextContentClassName = "rich-text-content";

const defaultEmptyHtml = "<p class='text-muted-foreground'>No content yet.</p>";

const RichTextContent = ({ html, emptyHtml = defaultEmptyHtml, className }) => {
    return (
        <div
            className={cn(richTextContentClassName, className)}
            dangerouslySetInnerHTML={{ __html: html || emptyHtml }}
        />
    );
};

export default RichTextContent;
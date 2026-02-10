import React from "react";
import clsx from "clsx";
import ReactMarkdown, {type Components} from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";

export interface MarkdownRendererProps {
    content: string;
    className?: string;
}

const markdownComponents: Components = {
    h1: ({node, ...props}) => (
        <h1 className="text-4xl font-semibold text-oxford-blue mt-6 mb-4" {...props} />
    ),
    h2: ({node, ...props}) => (
        <h2 className="text-3xl font-semibold text-oxford-blue mt-5 mb-3" {...props} />
    ),
    h3: ({node, ...props}) => (
        <h3 className="text-2xl font-semibold text-oxford-blue mt-4 mb-2" {...props} />
    ),
    h4: ({node, ...props}) => (
        <h4 className="text-xl font-semibold text-oxford-blue mt-3 mb-2" {...props} />
    ),
    p: ({node, ...props}) => (
        <p className="text-lg leading-relaxed text-oxford-blue mb-3" {...props} />
    ),
    strong: ({node, ...props}) => (
        <strong className="font-semibold text-oxford-blue" {...props} />
    ),
    em: ({node, ...props}) => (
        <em className="italic text-oxford-blue" {...props} />
    ),
    a: ({node, ...props}) => (
        <a className="text-blue-600 underline hover:text-blue-700 font-normal" target="_blank" rel="noreferrer" {...props} />
    ),
    ul: ({node, ...props}) => (
        <ul className="text-lg list-disc pl-6 mb-3 space-y-1 text-oxford-blue" {...props} />
    ),
    ol: ({node, ...props}) => (
        <ol className="text-lg list-decimal pl-6 mb-3 space-y-1 text-oxford-blue" {...props} />
    ),
    li: ({node, ...props}) => (
        <li className="text-lg  leading-relaxed text-oxford-blue" {...props} />
    ),
    blockquote: ({node, ...props}) => (
        <blockquote className="border-l-4 border-oxford-blue/40 pl-4 italic text-oxford-blue/80 bg-oxford-blue/5 rounded-r-md py-2 mb-3" {...props} />
    ),
    table: ({node, ...props}) => (
        <div className="overflow-x-auto mb-3 text-oxford-blue">
            <table className="w-full text-left border-collapse" {...props} />
        </div>
    ),
    thead: ({node, ...props}) => (
        <thead className="bg-oxford-blue/5 text-oxford-blue" {...props} />
    ),
    tbody: ({node, ...props}) => (
        <tbody className="divide-y divide-oxford-blue/10" {...props} />
    ),
    th: ({node, ...props}) => (
        <th className="px-3 py-2 font-semibold text-sm" {...props} />
    ),
    td: ({node, ...props}) => (
        <td className="px-3 py-2 align-top text-sm" {...props} />
    ),
    code: ({className, children, ...props}) => {
        const childNodes = React.Children.toArray(children);
        const text = childNodes.map((child) =>
            typeof child === "string" ? child : String(child)
        ).join("");

        return (
            <pre className="bg-oxford-blue/5 text-oxford-blue rounded-xl border border-oxford-blue/10 mb-4 mt-3 p-3 whitespace-pre-wrap break-words overflow-hidden">
                <code className={clsx("block font-mono text-sm leading-6 px-4 py-3", className)} {...props}>
                    {text}
                </code>
            </pre>
        );
    },
};

export default function MarkdownRenderer({content, className}: MarkdownRendererProps) {
    return (
        <div className={clsx("space-y-3", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={markdownComponents}
            >
                {content || ""}
            </ReactMarkdown>
        </div>
    );
}

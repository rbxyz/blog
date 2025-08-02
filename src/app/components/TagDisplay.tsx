"use client";

import Link from "next/link";
import { Tag } from "lucide-react";

interface TagData {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

interface TagDisplayProps {
  tags: TagData[];
  className?: string;
  showIcon?: boolean;
  clickable?: boolean;
}

export default function TagDisplay({ 
  tags, 
  className = "", 
  showIcon = false,
  clickable = true 
}: TagDisplayProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => {
        const tagColor = tag.color ?? "#3B82F6";
        const backgroundColor = `${tagColor}20`;
        const textColor = tag.color ?? "#3B82F6";

        const tagElement = (
          <span
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full transition-colors hover:opacity-80"
            style={{
              backgroundColor,
              color: textColor,
            }}
          >
            {showIcon && <Tag className="w-3 h-3" />}
            {tag.name}
          </span>
        );

        if (clickable) {
          return (
            <Link key={tag.id} href={`/tag/${tag.slug}`}>
              {tagElement}
            </Link>
          );
        }

        return <div key={tag.id}>{tagElement}</div>;
      })}
    </div>
  );
} 
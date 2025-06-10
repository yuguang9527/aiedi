"use client";

import Editor from "@/components/Editor";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-4">
          AI Writing Assistant
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Use AI to help improve your writing, provide suggestions and ideas
        </p>
        <Editor />
      </div>
    </main>
  );
}

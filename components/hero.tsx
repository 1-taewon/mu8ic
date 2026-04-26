"use client";

import { MinimalistHero } from "./ui/minimalist-hero";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "FEATURES", href: "#" },
  { label: "PRICING", href: "#" },
  { label: "CONTENT", href: "#" },
];

export function Hero() {
  const { user, loading } = useAuth();

  const navLinks = [
    { label: "FEATURES", href: "#" },
    { label: "PRICING", href: "#" },
    { label: user ? "WORKSPACE" : "LOGIN", href: user ? "/workspace" : "/auth" },
  ];

  const getStartedLink = user ? "/workspace" : "/auth";

  return (
    <MinimalistHero
      logoText="mu8ic"
      navLinks={navLinks}
      mainText="Create royalty-free music for your YouTube videos in seconds. Tailored to your content."
      readMoreLink={getStartedLink}
      imageSrc="https://ik.imagekit.io/fpxbgsota/image%2013.png?updatedAt=1753531863793"
      imageAlt="A portrait of a person in a black turtleneck, in profile."
      overlayText={{
        part1: "Create",
        part2: "Your Sound",
      }}
    />
  );
}

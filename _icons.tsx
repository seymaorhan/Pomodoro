// app/_icons.ts
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";

type IconProps = { size: number; color: string };

export const categoryIcons: Record<
  string,
  React.FC<IconProps>
> = {
  Kodlama: ({ size, color }) => (
    <MaterialCommunityIcons name="code-tags" size={size} color={color} />
  ),

  Ders: ({ size, color }) => (
    <MaterialCommunityIcons name="school" size={size} color={color} />
  ),

  Proje: ({ size, color }) => (
    <MaterialCommunityIcons name="briefcase" size={size} color={color} />
  ),

  Kitap: ({ size, color }) => (
    <MaterialCommunityIcons
      name="book-open-variant"
      size={size}
      color={color}
    />
  ),
};

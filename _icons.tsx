import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";

export const categoryIcons: any = {
  Kodlama: (size: number, color: string) => (
    <MaterialCommunityIcons name="code-tags" size={size} color={color} />
  ),
  Ders: (size: number, color: string) => (
    <MaterialCommunityIcons name="school" size={size} color={color} />
  ),
  Proje: (size: number, color: string) => (
    <MaterialCommunityIcons name="briefcase" size={size} color={color} />
  ),
  Kitap: (size: number, color: string) => (
    <MaterialCommunityIcons name="book-open-variant" size={size} color={color} />
  ),
  Okuma: (size: number, color: string) => (
    <MaterialCommunityIcons name="book" size={size} color={color} />
  ),
  Araştırma: (size: number, color: string) => (
    <MaterialCommunityIcons name="magnify" size={size} color={color} />
  ),
};

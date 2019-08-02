import { DetailedHTMLProps, InputHTMLAttributes } from "react";

export type ITag = {
  title: string;
  feature?: "red" | "blue" | "green" | "olive" | "black";
};

export type IInputTextProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  wrapperClassName?: string;
  handler?: (value: string) => void;
  required?: boolean;
  title?: string;
  error?: string;
  can_negative?: boolean;
  status?: string;
  maskChar?: string;
  mask?: string;
  onRef?: (ref: any) => void;
  is_loading?: boolean;
};

export type IIcon = string;

export type ValueOf<T> = T[keyof T];

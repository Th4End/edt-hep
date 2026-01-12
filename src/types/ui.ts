import type { TextareaHTMLAttributes } from "react";
import type { DialogProps } from "@radix-ui/react-dialog";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export type CommandDialogProps = DialogProps;

export interface AdBannerProps {
  username: string;
}

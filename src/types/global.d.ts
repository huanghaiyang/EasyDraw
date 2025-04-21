import IStageShield from "@/types/IStageShield";

declare global {
  interface Window {
    shield?: IStageShield;
  }
}

export {};

import { LoadingContext } from "@/components/loader";
import { useContext } from "react";

export const useLoading = () => useContext(LoadingContext);

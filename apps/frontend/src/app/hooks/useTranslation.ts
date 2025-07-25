"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { translateApi } from "@/lib";
import { ITranslatePrimaryKey, ITranslateRequest } from "@sff/shared-types";
import { useUser } from "./useUser";

export const useTranslation = () => {
  const { user } = useUser();
  const queryKey = ["translate", user ? user.userId : ""];
  const queryClient = useQueryClient();

  const getUserTranslationsQuery = useQuery({
    queryKey,
    queryFn: () => {
      if (!user) {
        return [];
      }

      return translateApi.getUserTranslations();
    },
  });

  const translateMutation = useMutation({
    mutationFn: async (request: ITranslateRequest) => {
      if (user) {
        return await translateApi.translateUserText(request);
      } else {
        return await translateApi.translatePublicText(request);
      }
    },
    onSuccess: (result) => {
      console.log(result);

      if (getUserTranslationsQuery.data && result) {
        queryClient.setQueryData(
          queryKey,
          getUserTranslationsQuery.data.concat([result])
        );
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (key: ITranslatePrimaryKey) => {
      if (!user) {
        throw new Error("user not logged in");
      }

      return translateApi.deleteUserTranslation(key);
    },
    onSuccess: (result) => {
      console.log(result);

      if (!getUserTranslationsQuery.data) {
        return;
      }

      const index = getUserTranslationsQuery.data.findIndex(
        (item) => item.requestId === result?.requestId
      );
      const copyData = [...getUserTranslationsQuery.data];
      copyData.splice(index, 1);

      queryClient.setQueryData(queryKey, copyData);
    },
  });

  return {
    translations: getUserTranslationsQuery.data ?? [],
    isLoading: getUserTranslationsQuery.status === "pending",
    translate: translateMutation.mutate,
    isTranslating: translateMutation.status === "pending",
    deleteTranslation: deleteMutation.mutate,
    isDeleting: deleteMutation.status === "pending",
  };
};

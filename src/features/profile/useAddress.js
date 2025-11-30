import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import addressApi from '../../shared/services/addressApi';

export const useGetUserAddresses = () => {
  return useQuery({
    queryKey: ["address"],
    queryFn: async () => {
      const res = await addressApi.getUserAddresses();
      return res;
    },
  });
};
export const useGetUserAddress = () => {
  return useQuery({
    queryKey: ["address"],
    queryFn: async () => {
      const response = await addressApi.getUserAddress();
      return response;
    },
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressData) => addressApi.createUserAddress(addressData),
    onSuccess(data) {
      console.log("address created succesfully!!!!", data);
      queryClient.invalidateQueries(["address"]);
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressId) => addressApi.deleteUserAddress(addressId),
    onSuccess(data) {
      console.log("address deleted succesfully!!!", data);
      queryClient.invalidateQueries(["address"]);
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressData) => addressApi.updateUserAddress(addressData),
    onSuccess(data) {
      console.log(data);
      queryClient.getQueryData(["address"]);
    },
  });
};
export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressData) => addressApi.setDefaultAddress(addressData),
    onSuccess(data) {
      console.log(data);
      queryClient.getQueryData(["address"]);
    },
  });
};

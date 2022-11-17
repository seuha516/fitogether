import client from './client';
import { userType } from './user';

export const getChatroomList = async () => {
  const response = await client.get<chatroomType[]>(`/api/chat/`);
  return response.data;
};
export const readChatroom = async (roomId: string) => {
  const response = await client.get<undefined>(`/api/chat/read/${roomId}/`);
  return response.data;
};
export const createChatroom = async (payload: { username: string }) => {
  const response = await client.post<{ id: number }>(`/api/chat/`, payload);
  return response.data;
};
export const getMessageList = async (roomId: string) => {
  const response = await client.get<messageType[]>(`/api/chat/${roomId}/`);
  return response.data;
};
export const getGroupMessageList = async (groupId: string) => {
  const response = await client.get<messageType[]>(`/api/chat/group/${groupId}/`);
  return response.data;
};

export type chatroomType = {
  id: number;
  user: userType | null;
  new: boolean;
  recent_message: string;
};
export type messageType = {
  id: number;
  author: userType | null;
  content: string;
  created: string;
};

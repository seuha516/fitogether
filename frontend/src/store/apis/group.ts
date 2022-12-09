import client from './client';
import { TagVisual } from './tag';
import { userType } from './user';

export const getGroups = async () => {
  const response = await client.get<getGroupsResponseType>(`/api/group/`);
  return response.data;
};
export const postGroup = async (payload: postGroupRequestType) => {
  const response = await client.post<postGroupResponseType>(`/api/group/`, payload);
  return response.data;
};
export const getGroupDetail = async (payload: string) => {
  const response = await client.get<getGroupDetailResponseType>(`/api/group/${payload}/`);
  return response.data;
};
export const deleteGroup = async (payload: string) => {
  const response = await client.delete(`/api/group/${payload}/`);
  return response.data;
};
export const checkGroupMember = async (payload: string) => {
  const response = await client.get<checkGroupMemberResponseType>(`/api/group/${payload}/mem_check/`);
  return response.data;
};
export const getGroupMembers = async (payload: string) => {
  const response = await client.get<getGroupMembersResponseType>(`/api/group/${payload}/member/`);
  return response.data;
};
export const joinGroup = async (payload: string) => {
  const response = await client.post(`/api/group/${payload}/member/`);
  return response.data;
};
export const exitGroup = async (payload: string) => {
  const response = await client.delete(`/api/group/${payload}/member/`);
  return response.data;
};
export const leaderChange = async (payload: leaderChangeRequestType) => {
  const response = await client.post(`/api/group/${payload.group_id}/leader_change/`, payload);
  return response.data;
};
export const getCerts = async (payload: getCertsRequestType) => {
  const response = await client.get<getCertsResponseType>(
    `/api/group/${payload.group_id}/cert/${payload.year}/${payload.month}/${payload.specific_date}/`,
  );
  return response.data;
};
export const createCert = async (payload: certRequestType) => {
  const response = await client.post<getCertsResponseType>(
    `/api/group/${payload.group_id}/cert/${payload.year}/${payload.month}/${payload.specific_date}/`,
    payload,
  );
  return response.data;
};
export const deleteCert = async (payload: certRequestType) => {
  const response = await client.delete<getCertsResponseType>(
    `/api/group/${payload.group_id}/cert/${payload.year}/${payload.month}/${payload.specific_date}/`,
    { data: payload },
  );
  return response.data;
};
export const getRequests = async (payload: string) => {
  const response = await client.get<getJoinReqResponseType>(`/api/group/${payload}/join_permission/`);
  return response.data;
};
export const postRequest = async (payload: joinReqLeaderRequestType) => {
  const response = await client.post(`/api/group/${payload.group_id}/join_permission/`, payload);
  return response.data;
};
export const deleteRequest = async (payload: joinReqLeaderRequestType) => {
  const response = await client.delete(`/api/group/${payload.group_id}/join_permission/`, { data: payload });
  return response.data;
};

export type Group = {
  id: number;
  group_name: string;
  number: number | null;
  start_date: string | null;
  end_date: string | null;
  member_number: number;
  lat: number | null;
  lng: number | null;
  address: string | null;
  free: boolean;
  my_group: string;
  tags: TagVisual[];
  prime_tag: TagVisual | undefined;
};

export type Fitelement = {
  id: number;
  type: string;
  workout_type: string;
  category: string;
  weight: number;
  rep: number;
  set: number;
  time: number;
};

export type FitelementRequestType = {
  type: string;
  workout_type: string;
  category: string;
  weight: number | null;
  rep: number | null;
  set: number | null;
  time: number;
};

export type Member = {
  id: number;
  username: string;
  image: string;
  cert_days: number;
  level: number;
};

export type MemberReq = {
  id: number;
  username: string;
  image: string;
  level: number;
};

export type MemberCert = {
  member: {
    username: string;
    nickname: string;
    image: string;
  };
  certs: Fitelement[];
  did: boolean;
};

export type getGroupsResponseType = {
  groups: Group[];
};

export type postGroupRequestType = {
  group_name: string;
  number: number | null;
  start_date: string | null;
  end_date: string | null;
  description: string;
  free: boolean;
  group_leader: string | null;
  lat: number | null;
  lng: number | null;
  address: string | null;
  goal: FitelementRequestType[];
  tags: TagVisual[];
  prime_tag: TagVisual | undefined;
};

export type postGroupResponseType = {
  id: number;
};

export type getGroupDetailResponseType = {
  group_id: number;
  group_name: string;
  number: number | null;
  start_date: string | null;
  end_date: string | null;
  description: string;
  free: boolean;
  group_leader: userType;
  goal: Fitelement[];
  member_number: number;
  lat: number | null;
  lng: number | null;
  address: string | null;
  tags: TagVisual[];
  prime_tag: TagVisual | undefined;
};

export type checkGroupMemberResponseType = {
  member_status: string;
};

export type getGroupMembersResponseType = {
  members: Member[];
  group_leader: string;
};

export type leaderChangeRequestType = {
  group_id: string;
  username: string;
};

export type certRequestType = {
  group_id: string;
  year: number;
  month: number;
  specific_date: number;
  fitelement_id: number;
};

export type getCertsRequestType = {
  group_id: string;
  year: number;
  month: number;
  specific_date: number;
};

export type getCertsResponseType = {
  all_certs: MemberCert[];
};

export type getJoinReqResponseType = {
  requests: MemberReq[];
};

export type joinReqLeaderRequestType = {
  group_id: string;
  username: string;
};

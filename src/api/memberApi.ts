import axios from "axios";
import { camelizeKeys, decamelizeKeys } from 'humps';
import type {
    Member,
    MemberListParams,
    MemberListResponse,
    CreateMemberDTO,
    UpdateMemberDTO
} from '@/types/member';

const API_BASE_URL = 'https://anytalk.com:8701';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response) => {
        if (response.data) response.data = camelizeKeys(response.data);
        return response;
    }
);
apiClient.interceptors.request.use(
    (config) => {
        const newConfig = { ...config };
        if (newConfig.data) newConfig.data = decamelizeKeys(newConfig.data);
        if (newConfig.params) newConfig.params = decamelizeKeys(newConfig.params);
        return newConfig;
    }
);

export const getMemberList = async (params: MemberListParams): Promise<MemberListResponse> => {
    const response = await apiClient.post('/member/getMemberList', params);
    return response.data;
};

export const getMemberDetail = async (userKey: number): Promise<Member> => {
    const response = await apiClient.post('/member/getMemberDetail', { userKey });
    return response.data;
};

export const createMember = async (dto: CreateMemberDTO): Promise<null> => {
    const response = await apiClient.post('/member/createMember', dto);
    return response.data;
};

export const updateMember = async (userKey: number, dto: UpdateMemberDTO): Promise<null> => {
    const response = await apiClient.put('/member/updateMember', { userKey, ...dto });
    return response.data;
};

export const deleteMember = async (userKey: number): Promise<void> => {
    await apiClient.delete('/member/deleteMember', { data: { userKey } });
};
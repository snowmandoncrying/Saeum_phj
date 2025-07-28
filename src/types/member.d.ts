// 회원 정보
export interface Member {
    userKey: number;
    nick : string;
    phone : string;
    age : number;
    email : string;
    gender : 'M' | 'F';
    deleteYn: 0 | 1;
}

// 회원 목록 조회 요청 파라미터
export interface MemberListParams {
    nick?: string;
    phone?: string;
    email?: string;
    page: number;
    size: number;
}

// 회원 목록 조회 응답
export interface MemberListResponse {
    members: Member[];
    totalCount: number;
    page: number;
    size: number;
    totalPages: number;
}

// 회원 추가할 때 보낼 데이터
export interface CreateMemberDTO {
    nick: string;
    phone: string;
    email: string;
    age?: number;
    gender?: 'M' | 'F';
}

// 회원 수정할 때 보낼 데이터
export interface UpdateMemberDTO {
    nick?: string;
    phone?: string;
    email?: string;
    age?: number;
    gender?: 'M' | 'F';
}
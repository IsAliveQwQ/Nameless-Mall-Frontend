export interface User {
    id: number; // Backend is Long (64-bit number)
    username: string; // Backend UserDTO
    email: string; // Backend UserDTO
    phone?: string; // Backend UserDTO.phone
    nickname?: string; // Backend UserDTO
    avatar?: string; // Backend UserDTO
    createdAt: string; // Backend UserDTO.createdAt
    // roles and status are typically returned in Login response or separate JWT claims, 
    // but if used in frontend User object, they must be optional or mapped from another source.
    // For now, based on UserDTO, these are NOT present.
    // However, to satisfy existing code, we will make them optional or check if they come from Auth response.
    roles?: string[];
    status?: number;
}

export interface RegisterInput {
    username: string;
    password: string;
    email: string;
    phoneNumber?: string;
}

export interface UserUpdateInput {
    nickname?: string; // Backend might use username or have a separate nickname
    email?: string;
    phone?: string;
    avatar?: string;
}

export interface PasswordChangeInput {
    oldPassword: string;
    newPassword: string;
}

export interface Address {
    id: number;
    userId: number;
    receiverName: string;
    receiverPhone: string;
    city: string;
    region: string;
    detailAddress: string;
    isDefault: number; // 0: No, 1: Yes
}

export interface AddressCreateInput {
    receiverName: string;
    receiverPhone: string;
    city: string;
    region: string;
    detailAddress: string;
    isDefault?: number;
}

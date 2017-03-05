export interface album {
    userId: number;
    id: number;
    title: string
};
export interface photo {
    albumId: number;
    id: number;
    title: string;
    url: string;
    thumbnailUrl: string
};
export interface post {
    userId: number;
    id: number;
    title: string;
    body: string
};
export interface comment {
    postId: number;
    id?: number;
    name: string;
    email: string;
    body: string;
};
export interface user {
    id: number;
    name: string;
    username: string;
    email: string
};

export interface manager {
    users: user[];
    posts: post[];
    albums: album[];
    photos: photo[];
    authUser: user;
    pageRoot: JQuery;
    anonRoot: JQuery;
    authRoot: JQuery;
    root: string;
    albumTops: number;
    albumSkip: number;
    photoTops: number;
}

export enum view {
    users,
    posts,
    albums
}
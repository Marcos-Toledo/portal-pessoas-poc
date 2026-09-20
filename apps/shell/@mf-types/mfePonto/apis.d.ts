
    export type RemoteKeys = 'mfePonto/mount';
    type PackageType<T> = T extends 'mfePonto/mount' ? typeof import('mfePonto/mount') :any;
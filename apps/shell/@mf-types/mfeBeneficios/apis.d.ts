
    export type RemoteKeys = 'mfeBeneficios/mount';
    type PackageType<T> = T extends 'mfeBeneficios/mount' ? typeof import('mfeBeneficios/mount') :any;
type AllowedKeys<T> = Exclude<keyof T & (string | number), "prototype" | "caller" | "arguments" | "callee">;

export type NestedKeyOf<ObjectType extends object> = {
    [Key in AllowedKeys<ObjectType>]:
    NonNullable<ObjectType[Key]> extends object
        ? `${Key}` | `${Key}.${NestedKeyOf<NonNullable<ObjectType[Key]>>}`
        : `${Key}`
}[AllowedKeys<ObjectType>];
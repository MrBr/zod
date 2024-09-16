///////////////////////////////////////////////////
////////////////      TYPES     ///////////////////
///////////////////////////////////////////////////
export interface $ZSF {
  $zsf: { version: number };
  type: string;
}

export interface $ZSFString extends $ZSF {
  type: "string";
  minLength?: number;
  maxLength?: number;
}

export interface $ZSFNumber extends $ZSF {
  type: "number";
  minimum?: number;
  maximum?: number;
}

export type IntegerTypes =
  | "int"
  | "int8"
  | "uint8"
  | "int16"
  | "uint16"
  | "int32"
  | "uint32"
  | "int64"
  | "uint64"
  | "int128"
  | "uint128";

export interface $ZSFInteger extends $ZSFNumber {
  format?: IntegerTypes;
  minimum?: number;
  maximum?: number;
}

export interface $ZSFBoolean extends $ZSF {
  type: "boolean";
}

export interface $ZSFNull extends $ZSF {
  type: "null";
}

export interface $ZSFOptional<T extends $ZSF = $ZSF> extends $ZSF {
  type: "optional";
  inner: T;
}

export interface $ZSFNever extends $ZSF {
  type: "never";
}

export interface $ZSFAny extends $ZSF {
  type: "any";
}

export interface $ZSFUnion<Elements extends $ZSF[] = $ZSF[]> extends $ZSF {
  type: "union";
  elements: Elements;
}

export interface $ZSFArray extends $ZSF {
  type: "array";
  prefixItems: $ZSF[];
  items: $ZSF;
}

export interface $ZSFObject<
  Shape extends { [k: string]: $ZSF } = { [k: string]: $ZSF },
> extends $ZSF {
  type: "object";
  properties: Shape;
}

export interface $ZSFIntersection extends $ZSF {
  type: "intersection";
  elements: $ZSF[];
}

export interface $ZSFTuple<T extends $ZSF[]> extends $ZSF {
  type: "array";
  prefixItems: T;
}

/////////////////////////////////////////////////
////////////////      CHECKS     ////////////////
/////////////////////////////////////////////////

// export interface $ZSFCheckRegex {
//   check: "regex";
//   pattern: string;
// }

// export interface $ZSFCheckEmail {
//   check: "email";
// }

// export interface $ZSFCheckURL {
//   check: "url";
// }

// export interface $ZSFCheckEmoji {
//   check: "emoji";
// }

// export interface $ZSFCheckUUID {
//   check: "uuid";
// }

// export interface $ZSFCheckUUIDv4 {
//   check: "uuidv4";
// }

// export interface $ZSFCheckUUIDv6 {
//   check: "uuidv6";
// }

// export interface $ZSFCheckNanoid {
//   check: "nanoid";
// }

// export interface $ZSFCheckGUID {
//   check: "guid";
// }

// export interface $ZSFCheckCUID {
//   check: "cuid";
// }

// export interface $ZSFCheckCUID2 {
//   check: "cuid2";
// }

// export interface $ZSFCheckULID {
//   check: "ulid";
// }

// export interface $ZSFCheckXID {
//   check: "xid";
// }

// export interface $ZSFCheckKSUID {
//   check: "ksuid";
// }

// export interface $ZSFCheckISODateTime {
//   check: "iso_datetime";
//   precision?: number;
//   local?: boolean;
// }

// export interface $ZSFCheckISODate {
//   check: "iso_date";
// }

// export interface $ZSFCheckISOTime {
//   check: "iso_time";
//   precision?: number;
//   local?: boolean;
// }

// export interface $ZSFCheckDuration {
//   check: "duration";
// }

// export interface $ZSFCheckIP {
//   check: "ip";
// }

// export interface $ZSFCheckIPv4 {
//   check: "ipv4";
// }

// export interface $ZSFCheckIPv6 {
//   check: "ipv6";
// }

// export interface $ZSFCheckBase64 {
//   check: "base64";
// }

// export interface $ZSFCheckJWT {
//   check: "jwt";
// }

// export interface $ZSFCheckJSONString {
//   check: "json_string";
// }

// export interface $ZSFCheckPrefix {
//   check: "prefix";
//   prefix: string;
// }

// export interface $ZSFCheckSuffix {
//   check: "suffix";
//   suffix: string;
// }

// export interface $ZSFCheckIncludes {
//   check: "includes";
//   includes: string;
// }

// export interface $ZSFCheckMinSize {
//   check: "min_size";
//   minimum: number;
// }

// export interface $ZSFCheckMaxSize {
//   check: "max_size";
//   maximum: number;
// }

// export interface $ZSFCheckSizeEquals {
//   check: "size_equals";
//   size: number;
// }

// export interface $ZSFCheckLessThan {
//   check: "less_than";
//   maximum: number | bigint | Date;
// }

// export interface $ZSFCheckLessThanOrEqual {
//   check: "less_than_or_equal";
//   maximum: number | bigint | Date;
// }

// export interface $ZSFCheckGreaterThan {
//   check: "greater_than";
//   minimum: number | bigint | Date;
// }

// export interface $ZSFCheckGreaterThanOrEqual {
//   check: "greater_than_or_equal";
//   minimum: number | bigint | Date;
// }

// export interface $ZSFCheckEquals {
//   check: "equals";
//   value: number | bigint | Date;
// }

// export interface $ZSFCheckMultipleOf {
//   check: "multiple_of";
//   multipleOf: number;
// }

// export type $ZSFStringFormatChecks =
//   | $ZSFCheckRegex
//   | $ZSFCheckEmail
//   | $ZSFCheckURL
//   | $ZSFCheckEmoji
//   | $ZSFCheckUUID
//   | $ZSFCheckUUIDv4
//   | $ZSFCheckUUIDv6
//   | $ZSFCheckNanoid
//   | $ZSFCheckGUID
//   | $ZSFCheckCUID
//   | $ZSFCheckCUID2
//   | $ZSFCheckULID
//   | $ZSFCheckXID
//   | $ZSFCheckKSUID
//   | $ZSFCheckISODateTime
//   | $ZSFCheckISODate
//   | $ZSFCheckISOTime
//   | $ZSFCheckDuration
//   | $ZSFCheckIP
//   | $ZSFCheckIPv4
//   | $ZSFCheckIPv6
//   | $ZSFCheckBase64
//   | $ZSFCheckJWT
//   | $ZSFCheckJSONString
//   | $ZSFCheckPrefix
//   | $ZSFCheckSuffix
//   | $ZSFCheckIncludes;

// export type $ZSFCheck =
//   | $ZSFStringFormatChecks
//   | $ZSFCheckMinSize
//   | $ZSFCheckMaxSize
//   | $ZSFCheckSizeEquals
//   | $ZSFCheckLessThan
//   | $ZSFCheckLessThanOrEqual
//   | $ZSFCheckGreaterThan
//   | $ZSFCheckGreaterThanOrEqual
//   | $ZSFCheckEquals
//   | $ZSFCheckMultipleOf;

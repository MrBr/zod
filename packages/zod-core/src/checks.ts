import * as core from "./core.js";
import type * as err from "./errors_v2.js";
import { type $ZodFailure, getParsedType } from "./parse.js";

import type * as types from "./types.js";

// export interface $ZodCheckCtx<out I> {
//   input: I;
//   fail?: $ZodFailure | undefined;
//   addIssue(
//     issue: err.$ZodIssueData,
//     schema?: { error?: err.$ZodErrorMap<never> | undefined }
//   ): void;
// }

// export interface core.$ZodCheckDef {
//   deps?: string[];
//   error?: err.$ZodErrorMap<never> | undefined;
// }

// export abstract class $ZodCheck<
//   in I,
//   out O = I,
//   out Def extends core.$ZodCheckDef = core.$ZodCheckDef,
// > extends Dynamic<Def> {
//   abstract check: string;
//   constructor(def: object) {
//     super();
//     Object.assign(this, def);
//   }

//   // return T or ZodFailure
//   // T cannot occur in signature to maintain contravariance
//   abstract run(ctx: $ZodCheckCtx<I>): void | Promise<void>;

//   // alternative signature
//   // return T or ZodFailure
//   // returned value will override input
//   abstract run2: (ctx: I) => O | $ZodFailure;
// }

///////////////////////////////////////
/////      $ZodCheckLessThan      /////
///////////////////////////////////////
interface $ZodCheckLessThanDef extends core.$ZodCheckDef {
  value: types.Numeric;
  inclusive: boolean;
  error?: err.$ZodErrorMap<err.$ZodIssueLessThan> | undefined;
}
export class $ZodCheckLessThan<
  T extends types.Numeric = types.Numeric,
> extends core.$ZodCheck<T, $ZodCheckLessThanDef> {
  override check = "less_than" as const;

  run(ctx: $ZodCheckCtx<T>): void {
    if (this.inclusive ? ctx.input <= this.value : ctx.input < this.value)
      return;

    ctx.addIssue(
      {
        code: "invalid_value",
        expected: this.inclusive ? "less_than_or_equal" : "less_than",
        maximum: this.value,
        input: ctx.input,
      },
      this
    );
  }
}

/////////////////////////////////////
/////    $ZodCheckGreaterThan    /////
/////////////////////////////////////
interface $ZodCheckGreaterThanDef extends core.$ZodCheckDef {
  value: types.Numeric;
  inclusive: boolean;
  error?: err.$ZodErrorMap<err.$ZodIssueGreaterThan> | undefined;
}
export class $ZodCheckGreaterThan<
  T extends types.Numeric = types.Numeric,
> extends core.$ZodCheck<T, $ZodCheckGreaterThanDef> {
  override check = "greater_than" as const;

  run(ctx: $ZodCheckCtx<T>): void {
    if (this.inclusive ? ctx.input >= this.value : ctx.input >= this.value)
      return;

    ctx.addIssue(
      {
        code: "invalid_value",
        expected: this.inclusive ? "greater_than_or_equal" : "greater_than",
        minimum: this.value,
        input: ctx.input,
      },
      this
    );
  }
}

/////////////////////////////////////
/////    $ZodCheckMultipleOf    /////
/////////////////////////////////////
// https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034
function floatSafeRemainder(val: number, step: number) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return (valInt % stepInt) / 10 ** decCount;
}

interface $ZodCheckMultipleOfDef<T extends number | bigint>
  extends core.$ZodCheckDef {
  value: T;
  error?: err.$ZodErrorMap<err.$ZodIssueMultipleOf> | undefined;
}
export class $ZodCheckMultipleOf<
  T extends number | bigint = number | bigint,
> extends core.$ZodCheck<T, $ZodCheckMultipleOfDef<T>> {
  override check = "multiple_of" as const;

  run(ctx: $ZodCheckCtx<T>): void {
    if (typeof ctx.input !== typeof this.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    // the casts are safe because we know the types are the same
    const isMultiple =
      typeof ctx.input === "bigint"
        ? ctx.input % (this.value as bigint) === BigInt(0)
        : floatSafeRemainder(ctx.input, this.value as number);

    if (!isMultiple) {
      ctx.addIssue(
        {
          code: "invalid_value",
          expected: "multiple_of",
          value: this.value,
          input: ctx.input,
        },
        this
      );
    }
  }
}

//////////////////////////////////
/////    $ZodCheckMaxSize    /////
//////////////////////////////////
export type $ZodSizable = string | Array<unknown> | Set<unknown> | File;

function getSize(input: any): {
  type: "string" | "array" | "set" | "file";
  size: number;
} {
  if (typeof input === "string") return { type: "string", size: input.length };
  if (Array.isArray(input)) return { type: "array", size: input.length };
  if (input instanceof Set) return { type: "set", size: input.size };
  if (input instanceof File) return { type: "file", size: input.size };
  throw new Error(`Invalid input for size check: ${getParsedType(input)}`);
}

interface $ZodCheckMaxSizeDef extends core.$ZodCheckDef {
  maximum: number;
  error?: err.$ZodErrorMap<err.$ZodIssueTooBig> | undefined;
}
export class $ZodCheckMaxSize<
  T extends types.Sizeable = types.Sizeable,
> extends core.$ZodCheck<T, $ZodCheckMaxSizeDef> {
  override check = "max_size" as const;

  run(ctx: $ZodCheckCtx<T>): void {
    const size = getSize(ctx.input);
    if (size.size > this.maximum) {
      ctx.addIssue(
        {
          code: "invalid_size",
          received: "too_big",
          maximum: this.maximum,
          domain: size.type,
          input: ctx.input,
        },
        this
      );
    }
  }
}

//////////////////////////////////
/////    $ZodCheckMinSize    /////
//////////////////////////////////
interface $ZodCheckMinSizeDef extends core.$ZodCheckDef {
  minimum: number;
  error?: err.$ZodErrorMap<err.$ZodIssueTooSmall> | undefined;
}
export class $ZodCheckMinSize<
  T extends types.Sizeable = types.Sizeable,
> extends core.$ZodCheck<T, $ZodCheckMinSizeDef> {
  override check = "size_greater_than" as const;

  run(ctx: $ZodCheckCtx<T>): void {
    const size = getSize(ctx.input);
    if (size.size < this.minimum) {
      ctx.addIssue(
        {
          code: "invalid_size",
          received: "too_small",
          minimum: this.minimum,
          domain: size.type,
          input: ctx.input,
        },
        this
      );
    }
  }
}

/////////////////////////////////////
/////    $ZodCheckSizeEquals    /////
/////////////////////////////////////
interface $ZodCheckSizeEqualsDef extends core.$ZodCheckDef {
  size: number;
  error?:
    | err.$ZodErrorMap<err.$ZodIssueTooBig | err.$ZodIssueTooSmall>
    | undefined;
}

export class $ZodCheckSizeEquals<
  T extends types.Sizeable = types.Sizeable,
> extends core.$ZodCheck<T, $ZodCheckSizeEqualsDef> {
  override check = "size_equals" as const;

  run(ctx: $ZodCheckCtx<T>): void {
    const size = getSize(ctx.input);
    if (size.size !== this.size) {
      const tooBig = size.size > this.size;
      ctx.addIssue(
        {
          code: "invalid_size",
          ...(tooBig
            ? { received: "too_big", maximum: this.size }
            : { received: "too_small", minimum: this.size }),
          domain: size.type,
          input: ctx.input,
        },
        this
      );
    }
  }
}

////////////////////////////////
/////    $ZodCheckRegex    /////
////////////////////////////////
interface $ZodCheckRegexDef extends core.$ZodCheckDef {
  pattern: RegExp;
  error?: err.$ZodErrorMap<err.$ZodIssueRegex> | undefined;
}

export abstract class $ZodCheckRegex<
  D extends core.$ZodCheckRegexDef = $ZodCheckRegexDef,
> extends core.$ZodCheck<string, D> {
  abstract override check: err.$ZodStringFormats;
  override run(ctx: $ZodCheckCtx<string>): void {
    if (!this.pattern.test(ctx.input)) {
      ctx.addIssue(
        {
          code: "invalid_format",
          format: this.check,
          pattern: this.pattern,
          input: ctx.input,
        } as err.$ZodIssueData,
        this
      );
    }
  }
}

///////////////////////////////////
/////    $ZodCheckIncludes    /////
///////////////////////////////////
interface $ZodCheckIncludesDef extends core.$ZodCheckRegexDef {
  includes: string;
}
export class $ZodCheckIncludes extends core.$ZodCheck<
  string,
  $ZodCheckIncludesDef
> {
  override check = "includes" as const;

  override run(ctx: $ZodCheckCtx<string>): void {
    if (!ctx.input.includes(this.includes)) {
      ctx.addIssue(
        {
          code: "invalid_format",
          format: this.check,
          includes: this.includes,
          input: ctx.input,
        },
        this
      );
    }
  }
}

///////////////////////////////
/////    $ZodCheckTrim    /////
///////////////////////////////
export class $ZodCheckTrim extends core.$ZodCheck<string, core.$ZodCheckDef> {
  override check = "trim" as const;
  override run(ctx: $ZodCheckCtx<string>): void {
    ctx.input = ctx.input.trim();
  }
}

//////////////////////////////////////
/////    $ZodCheckToLowerCase    /////
//////////////////////////////////////
export class $ZodCheckToLowerCase extends core.$ZodCheck<
  string,
  core.$ZodCheckDef
> {
  override check = "to_lowercase" as const;
  override run(ctx: $ZodCheckCtx<string>): void {
    ctx.input = ctx.input.toLowerCase();
  }
}

//////////////////////////////////////
/////    $ZodCheckToUpperCase    /////
//////////////////////////////////////
export class $ZodCheckToUpperCase extends core.$ZodCheck<
  string,
  core.$ZodCheckDef
> {
  override check = "to_uppercase" as const;
  override run(ctx: $ZodCheckCtx<string>): void {
    ctx.input = ctx.input.toUpperCase();
  }
}

export class $ZodCheckNormalize extends core.$ZodCheck<
  string,
  core.$ZodCheckDef
> {
  override check = "normalize" as const;
  override run(ctx: $ZodCheckCtx<string>): void {
    ctx.input = ctx.input.normalize();
  }
}

/////////////////////////////////////
/////    $ZodCheckStartsWith    /////
/////////////////////////////////////
interface $ZodCheckStartsWithDef extends core.$ZodCheckDef {
  starts_with: string;
}
export class $ZodCheckStartsWith extends core.$ZodCheck<
  string,
  $ZodCheckStartsWithDef
> {
  override check = "starts_with" as const;
  override run(ctx: $ZodCheckCtx<string>): void {
    if (!ctx.input.startsWith(this.starts_with)) {
      ctx.addIssue(
        {
          code: "invalid_format",
          format: this.check,
          starts_with: this.starts_with,
          input: ctx.input,
        },
        this
      );
    }
  }
}

//////////////////////////////////
/////   $ZodCheckEndsWith    /////
//////////////////////////////////
interface $ZodCheckEndsWithDef extends core.$ZodCheckDef {
  ends_with: string;
}
export class $ZodCheckEndsWith extends core.$ZodCheck<
  string,
  $ZodCheckEndsWithDef
> {
  override check = "ends_with" as const;
  override run(ctx: $ZodCheckCtx<string>): void {
    if (!ctx.input.endsWith(this.ends_with)) {
      ctx.addIssue(
        {
          code: "invalid_format",
          format: this.check,
          ends_with: this.ends_with,
          input: ctx.input,
        },
        this
      );
    }
  }
}

///////////////////////////////////
/////    $ZodCheckFileType    /////
///////////////////////////////////
interface $ZodCheckFileTypeDef extends core.$ZodCheckDef {
  fileTypes: types.MimeTypes[];
}
export class $ZodCheckFileType extends core.$ZodCheck<
  File,
  $ZodCheckFileTypeDef
> {
  override check = "file_type" as const;
  override run(ctx: $ZodCheckCtx<File>): void {
    if (this.fileTypes.indexOf(ctx.input.type)) {
      ctx.addIssue(
        {
          code: "invalid_type",
          expected: "literal",
          literalValues: this.fileTypes,
          input: ctx.input,
          path: ["type"],
        },
        this
      );
    }
  }
}

///////////////////////////////////
/////    $ZodCheckFileName    /////
///////////////////////////////////
interface $ZodCheckFileNameDef extends core.$ZodCheckDef {
  fileName: string;
}
export class $ZodCheckFileName extends core.$ZodCheck<
  File,
  $ZodCheckFileNameDef
> {
  override check = "file_name" as const;

  override run(ctx: $ZodCheckCtx<File>): void {
    if (this.fileName !== ctx.input.name) {
      ctx.addIssue(
        {
          code: "invalid_type",
          expected: "literal",
          literalValues: [this.fileName],
          input: ctx.input,
          path: ["name"],
        },
        this
      );
    }
  }
}

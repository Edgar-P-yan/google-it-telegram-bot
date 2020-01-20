import winston from 'winston';
import { Namespace } from 'cls-hooked';

export const addMetadataFromCls: TAddMetadataFromClsFormatWrap = winston.format(
  (info, opts: IAddMetadataFromClsOptions) => {
    info[opts.metadataProp] = opts.clsNs.get(opts.clsProp);
    return info;
  },
);

/**
 * winston does not export these internal types,
 * so we fetch them through ReturnType
 */
export type TWinstonFormatWrap = ReturnType<typeof winston.format>;
export type TWinstonFormat = ReturnType<TWinstonFormatWrap>;

/**
 * after we got type Format we can create custom
 * FormatWrap type, with strongly typed opts argument
 */
export type TAddMetadataFromClsFormatWrap = (
  opts: IAddMetadataFromClsOptions,
) => TWinstonFormat;

export interface IAddMetadataFromClsOptions {
  clsNs: Namespace;
  clsProp: string;
  metadataProp: string;
}

import { createLogger } from './index';
import _ from 'lodash';
import * as inversify from 'inversify';

export function loggerDynamicValueFactory(ctx: inversify.interfaces.Context) {
  const loggerLabel = getLabel(
    _.get(ctx, ['currentRequest', 'parentRequest', 'serviceIdentifier']),
  );

  return createLogger(loggerLabel);
}

function getLabel(
  serviceIdentifier: inversify.interfaces.ServiceIdentifier<any>,
): string {
  if (_.isString(serviceIdentifier)) {
    return serviceIdentifier;
  }

  if (typeof serviceIdentifier === 'symbol') {
    return Symbol.keyFor(serviceIdentifier);
  }

  if (_.isFunction(serviceIdentifier)) {
    return serviceIdentifier.name;
  }

  return _.toString(serviceIdentifier);
}

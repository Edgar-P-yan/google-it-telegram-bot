import cls from 'cls-hooked';

export class ClsNS {
  private ns: cls.Namespace;

  constructor() {
    this.ns = cls.createNamespace('bot');
  }

  get(): cls.Namespace {
    return this.ns;
  }
}

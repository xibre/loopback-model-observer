class ModelObserver {
  constructor(Model) {
    this.Model = Model;
  }

  beforePropertyChanged(propertyName, callback) {
    this.Model.observe('before save', async (ctx) => {
      if (ctx.isNewInstance || !ctx.data || !ctx.currentInstance) {
        return;
      }

      const newValue = ctx.data[propertyName];

      if (newValue === undefined) {
        return;
      }

      const oldValue = ctx.currentInstance[propertyName];

      if (newValue === oldValue) {
        return;
      }

      const value = await callback(ctx, oldValue, newValue);

      if (value !== undefined) {
        ctx.data[propertyName] = value;
      }
    });
  }

  afterPropertyChanged(propertyName, callback) {
    this.Model.observe('before save', async (ctx) => {
      if (ctx.isNewInstance || !ctx.data || !ctx.currentInstance) {
        return;
      }

      ctx.hookState.$propertyChanged = ctx.hookState.$propertyChanged || {};
      ctx.hookState.$propertyChanged[propertyName] = ctx.currentInstance[propertyName];
    });

    this.Model.observe('after save', async (ctx) => {
      const oldValue = ctx.hookState.$propertyChanged[propertyName];

      if (oldValue === undefined) {
        return;
      }

      const newValue = ctx.instance[propertyName];

      if (newValue !== oldValue) {
        await callback(ctx, oldValue, newValue);
      }
    });
  }

  beforeCreate(callback) {
    this.Model.observe('before save', async (ctx) => {
      if (ctx.isNewInstance && ctx.instance) {
        await callback(ctx);
      }
    });
  }

  beforeDelete(callback) {
    // TODO: implement
  }

  beforeUpdate(callback) {
    this.Model.observe('before save', async (ctx) => {
      if (!ctx.isNewInstance && ctx.data) {
        await callback(ctx);
      }
    });
  }

  afterCreate(callback) {
    this.Model.observe('after save', async (ctx) => {
      if (ctx.isNewInstance && ctx.instance) {
        await callback(ctx);
      }
    });
  }

  afterDelete(callback) {
    // TODO: implement
  }

  afterUpdate(callback) {
    this.Model.observe('after save', async (ctx) => {
      if (!ctx.isNewInstance && ctx.instance) {
        await callback(ctx);
      }
    });
  }
};

module.exports = ModelObserver;

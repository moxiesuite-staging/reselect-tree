const debug = require("debug")("reselect-tree:esdoc-plugin:doc");
// hack: depends on esdoc internal class
const AbstractDoc = require('esdoc/out/src/Doc/AbstractDoc').default;
const ParamParser = require('esdoc/out/src/Parser/ParamParser').default;

/**
 * Doc Class from selector code file.
 */
class SelectorDoc extends AbstractDoc {
  /**
   * apply own tag.
   * @private
   */
  _apply() {
    super._apply();

    this._$selectorTarget();

    Reflect.deleteProperty(this._value, 'export');
    Reflect.deleteProperty(this._value, 'importPath');
    Reflect.deleteProperty(this._value, 'importStyle');
  }

  /** use name property of self node. */
  _$kind() {
    super._$kind();

    this._value.kind = 'function';
  }

  /** set name and selectorId from special esdoc property. */
  _$name() {
    super._$name();

    const chain = [this._node._esdocSelectorName];
    let parent = this._node.parent;
    while (parent) {
      if (parent._esdocSelectorName) chain.push(parent._esdocSelectorName);
      parent = parent.parent;
    }
    debug("chain %o", chain);
    this._value.name = chain.reverse().join('.');
    this._value.selectorId = this._node._esdocSelectorId;
  }

  _$params() {
    super._$params();

    this._value.params = [{
      "name": "state",
      "types": ["Object"],
      "description": "initial state"
    }];
  }

  _$return() {
    this._value.return = {
      "types": ["Object"],
      "description": "new state"
    };
  }

  /** set memberof to use parent selector nod and file path. */
  _$memberof() {
    super._$memberof();

    const chain = [];
    let parent = this._node.parent;
    while (parent) {
      if (parent._esdocSelectorName) chain.push(parent._esdocSelectorName);
      parent = parent.parent;
    }

    const filePath = this._pathResolver.filePath;

    if (chain.length) {
      this._value.memberof = `${filePath}~${chain.reverse().join('.')}`;
      this._value.selectorDepth = chain.length;
    } else {
      this._value.memberof = filePath;
      this._value.selectorDepth = 0;
    }
  }

  // /** set describe by using selector node arguments. */
  // _$desc() {
  //   super._$desc();
  //   if (this._value.description) return;

  //   this._value.description = this._node.arguments[0].value;
  // }

  /** for @selectorTarget. */
  _$selectorTarget() {
    const values = this._findAllTagValues(['@selector', '@selectorTarget']);
    if (!values) return;

    this._value.selectorTarget = [];
    for (const value of values) {
      const {typeText} = ParamParser.parseParamValue(value, true, false, false);
      this._value.selectorTarget.push(typeText);
    }
  }

  _$selectorTarget() {
    // alias of selectorTarget
  }
}

module.exports = SelectorDoc;

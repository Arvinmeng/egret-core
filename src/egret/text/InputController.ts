/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
module egret {
    /**
     * @private
     */
    export class InputController extends HashObject {
        private stageText:egret.StageText;
        private _isFocus:boolean = false;

        private _text:TextField = null;

        private _isFirst:boolean = true;
        public constructor() {
            super();

            this._isFirst = true;
        }

        public init(text:TextField):void {
            this._text = text;
            this.stageText = egret.StageText.create();
            var point = this._text.localToGlobal();
            this.stageText._open(point.x, point.y, this._text._explicitWidth, this._text._explicitHeight);
        }

        public _addStageText():void {
            if (!this._text._properties._inputEnabled) {
                this._text._touchEnabled = true;
            }

            this.stageText._add();
            this.stageText._addListeners();

            this.stageText.addEventListener("blur", this.onBlurHandler, this);
            this.stageText.addEventListener("focus", this.onFocusHandler, this);
            this.stageText.addEventListener("updateText", this.updateTextHandler, this);
            this._text.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onMouseDownHandler, this);
            egret.MainContext.instance.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onStageDownHandler, this);
            egret.MainContext.instance.stage.addEventListener(egret.Event.RESIZE, this.onResize, this);
        }

        public _removeStageText():void {
            this.stageText._remove();
            this.stageText._removeListeners();

            if (!this._text._properties._inputEnabled) {
                this._text._touchEnabled = false;
            }

            this.stageText.removeEventListener("blur", this.onBlurHandler, this);
            this.stageText.removeEventListener("focus", this.onFocusHandler, this);
            this.stageText.removeEventListener("updateText", this.updateTextHandler, this);
            this._text.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onMouseDownHandler, this);
            egret.MainContext.instance.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onStageDownHandler, this);
            egret.MainContext.instance.stage.removeEventListener(egret.Event.RESIZE, this.onResize, this);
        }

        private onResize():void {
            this._isFirst = true;
        }

        public _getText():string {
            return this.stageText._getText();
        }

        public _setText(value:string) {
            this.stageText._setText(value);
        }

        private onFocusHandler(event):void {
            this.hideText();
        }

        //显示文本
        private onBlurHandler(event):void {
            this.showText();
        }

        //点中文本
        private onMouseDownHandler(event:TouchEvent) {
            event.stopPropagation();

            if (!this._text._visible) {
                return;
            }

            this.stageText._show();
        }

        //未点中文本
        private onStageDownHandler(event:TouchEvent) {
            this.stageText._hide();

            this.showText();
        }

        private showText():void {
            if (this._isFocus) {
                this._isFocus = false;

                this.resetText();
            }
        }

        private hideText():void {
            if (!this._isFocus) {
                this._text._setBaseText("");
                this._isFocus = true;
            }
        }

        private updateTextHandler(event):void {
            this.resetText();
            //抛出change事件
            this._text.dispatchEvent(new egret.Event(egret.Event.CHANGE));
        }

        private resetText():void {
            this._text._setBaseText(this.stageText._getText());
        }

        public _updateTransform():void {//
            var self = this;
            var textWorldTransform = self._text._worldTransform;
            //todo 等待worldTransform的性能优化完成，合并这块代码
            var oldTransFormA = textWorldTransform.a;
            var oldTransFormB = textWorldTransform.b;
            var oldTransFormC = textWorldTransform.c;
            var oldTransFormD = textWorldTransform.d;
            var oldTransFormTx = textWorldTransform.tx;
            var oldTransFormTy = textWorldTransform.ty;
            self._text._updateBaseTransform();
            var newTransForm = textWorldTransform;
            if (self._isFirst || oldTransFormA != newTransForm.a ||
                oldTransFormB != newTransForm.b ||
                oldTransFormC != newTransForm.c ||
                oldTransFormD != newTransForm.d ||
                oldTransFormTx != newTransForm.tx ||
                oldTransFormTy != newTransForm.ty) {
                self._isFirst = false;
                var point = self._text.localToGlobal();
                self.stageText.changePosition(point.x, point.y);

                egret.callLater(function () {
                    self.stageText._setScale(self._text._worldTransform.a, self._text._worldTransform.d);
                }, self);
            }
        }

        public _updateProperties():void {
            var self = this;
            var stage:egret.Stage = self._text._stage;
            if (stage == null) {
                self.stageText._setVisible(false);
            }
            else {
                var item:DisplayObject = self._text;
                var visible:boolean = item._visible;
                while (true) {
                    if (!visible) {
                        break;
                    }
                    item = item.parent;
                    if (item == stage) {
                        break;
                    }
                    visible = item._visible;
                }
                self.stageText._setVisible(visible);
            }

            var tempProperties:egret.TextFieldProperties = self._text._properties;

            self.stageText._setMultiline(tempProperties._multiline);
            self.stageText._setMaxChars(tempProperties._maxChars);

            self.stageText._setSize(tempProperties._size);
            self.stageText._setTextColor(tempProperties._textColorString);
            self.stageText._setTextFontFamily(tempProperties._fontFamily);
            self.stageText._setBold(tempProperties._bold);
            self.stageText._setItalic(tempProperties._italic);
            self.stageText._setTextAlign(tempProperties._textAlign);

            var rect:egret.Rectangle = self._text._getSize(Rectangle.identity);
            self.stageText._setWidth(rect.width);
            self.stageText._setHeight(rect.height);
            self.stageText._setTextType(tempProperties._displayAsPassword ? "password" : "text");
            self.stageText._setText(tempProperties._text);

            //整体修改
            self.stageText._resetStageText();

            self._updateTransform();
        }
    }
}
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
 * EXPRESS OR IMPLIED W
 private _linesArr:Array<egret.ILineElement> = [];ARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
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
    export class TextFieldProperties {
        public _inputEnabled:boolean = false;
        public _type:string = "";
        public _text:string = "";
        public _displayAsPassword:boolean = false;
        public _fontFamily:string = TextField.default_fontFamily;
        public _size:number = 30;
        public _italic:boolean = false;
        public _bold:boolean = false;
        public _textColor:number = 0xFFFFFF;
        public _textColorString:string = "#FFFFFF";
        public _strokeColorString:string = "#000000";

        public _strokeColor:number = 0x000000;
        public _stroke:number = 0;
        public _textAlign:string = "left";
        public _verticalAlign:string = "top";
        public maxWidth;

        public _maxChars:number = 0;
        public _scrollV:number = -1;
        public _maxScrollV:number = 0;
        public _lineSpacing:number = 0;
        public _numLines:number = 0;
        public _multiline:boolean = false;
        private _isFlow:boolean = false;
        private _textArr:Array<egret.ITextElement> = [];
        private _isArrayChanged:boolean = false;
        public _textMaxWidth:number = 0;//文本全部显示时宽
        public _textMaxHeight:number = 0;//文本全部显示时高（无行间距）
        private _linesArr:Array<egret.ILineElement> = [];
    }
}
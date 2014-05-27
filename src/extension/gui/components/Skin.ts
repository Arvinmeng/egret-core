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

/// <reference path="../../../egret/display/DisplayObject.ts"/>
/// <reference path="../../../egret/events/EventDispatcher.ts"/>
/// <reference path="SkinnableComponent.ts"/>
/// <reference path="../core/IContainer.ts"/>
/// <reference path="../core/ISkin.ts"/>
/// <reference path="../core/IStateClient.ts"/>
/// <reference path="../core/IVisualElement.ts"/>
/// <reference path="../core/IVisualElementContainer.ts"/>
/// <reference path="../events/ElementExistenceEvent.ts"/>
/// <reference path="../events/StateChangeEvent.ts"/>
/// <reference path="../states/State.ts"/>

module ns_egret {

	/**
	 * @class ns_egret.Skin
	 * @classdesc
	 * 含有视图状态功能的皮肤基类。注意：为了减少嵌套层级，此皮肤没有继承显示对象，若需要显示对象版本皮肤，请使用Skin。
	 * @see org.flexlite.domUI.components.supportClasses.Skin
	 * @extends ns_egret.EventDispatcher
	 * @implements ns_egret.IStateClient
	 * @implements ns_egret.ISkin
	 * @implements ns_egret.IContainer
	 */
	export class Skin extends EventDispatcher
		implements IStateClient, ISkin, IContainer{
		/**
		 * 构造函数
		 * @method ns_egret.Skin#constructor
		 */		
		public constructor(){
			super();
		}
		
		/**
		 * 组件的最大测量宽度,仅影响measuredWidth属性的取值范围。
		 * @member ns_egret.Skin#maxWidth
		 */	
		public maxWidth:number = 10000;
		/**
		 * 组件的最小测量宽度,此属性设置为大于maxWidth的值时无效。仅影响measuredWidth属性的取值范围。
		 * @member ns_egret.Skin#minWidth
		 */
		public minWidth:number = 0;
		/**
		 * 组件的最大测量高度,仅影响measuredHeight属性的取值范围。
		 * @member ns_egret.Skin#maxHeight
		 */
		public maxHeight:number = 10000;
		/**
		 * 组件的最小测量高度,此属性设置为大于maxHeight的值时无效。仅影响measuredHeight属性的取值范围。
		 * @member ns_egret.Skin#minHeight
		 */
		public minHeight:number = 0;
		/**
		 * 组件宽度
		 * @member ns_egret.Skin#width
		 */
		public width:number = NaN;
		/**
		 * 组件高度
		 * @member ns_egret.Skin#height
		 */
		public height:number = NaN;

        private _initialized:boolean = false;
        /**
         * 创建子项,子类覆盖此方法以完成组件子项的初始化操作，
         * 请务必调用super.createChildren()以完成父类组件的初始化
         * @method ns_egret.Skin#createChildren
         */
        public createChildren():void{

        }

		private _hostComponent:SkinnableComponent;
		/**
		 * @member ns_egret.Skin#hostComponent
		 */
		public get hostComponent():SkinnableComponent{
			return this._hostComponent;
		}
		/**
		 * @inheritDoc
		 */
		public set hostComponent(value:SkinnableComponent){
			this._setHostComponent(value);
		}

        public _setHostComponent(value:SkinnableComponent){
            if(this._hostComponent==value)
                return;
            if(!this._initialized){
                this._initialized = true;
                this.createChildren();
            }
            var i:number;
            if(this._hostComponent){
                for(i = this._elementsContent.length - 1; i >= 0; i--){
                    this._elementRemoved(this._elementsContent[i], i);
                }
            }

            this._hostComponent = value;

            if(this._hostComponent){
                var n:number = this._elementsContent.length;
                for (i = 0; i < n; i++){
                    var elt:IVisualElement = this._elementsContent[i];
                    if (elt.parent&&"removeElement" in elt.parent)
                        (<IVisualElementContainer><any> (elt.parent)).removeElement(elt);
                    else if(elt.owner&&"removeElement" in elt.owner)
                        (<IContainer><any> (elt.owner)).removeElement(elt);
                    this._elementAdded(elt, i);
                }

                this.initializeStates();

                if(this.currentStateChanged){
                    this.commitCurrentState();
                }
            }
        }

		private _elementsContent:Array<any> = [];
		/**
		 * 返回子元素列表
		 */
		public _getElementsContent():Array<any>{
			return this._elementsContent;
		}
		
		/**
		 * 设置容器子对象数组 。数组包含要添加到容器的子项列表，之前的已存在于容器中的子项列表被全部移除后添加列表里的每一项到容器。
		 * 设置该属性时会对您输入的数组进行一次浅复制操作，所以您之后对该数组的操作不会影响到添加到容器的子项列表数量。
		 */		
		public set elementsContent(value:Array<any>){
			if(value==null)
				value = [];
			if(value==this._elementsContent)
				return;
			if(this._hostComponent){
				var i:number;
				for (i = this._elementsContent.length - 1; i >= 0; i--){
					this._elementRemoved(this._elementsContent[i], i);
				}
				
				this._elementsContent = value.concat();
				
				var n:number = this._elementsContent.length;
				for (i = 0; i < n; i++){   
					var elt:IVisualElement = this._elementsContent[i];
					
					if(elt.parent&&"removeElement" in elt.parent)
						(<IVisualElementContainer><any> (elt.parent)).removeElement(elt);
					else if(elt.owner&&"removeElement" in elt.owner)
						(<IContainer><any> (elt.owner)).removeElement(elt);
					this._elementAdded(elt, i);
				}
			}
			else{
				this._elementsContent = value.concat();
			}
		}
		
		/**
		 * @member ns_egret.Skin#numElements
		 */
		public get numElements():number{
			return this._elementsContent.length;
		}
		
		/**
		 * @method ns_egret.Skin#getElementAt
		 * @param index {number} 
		 * @returns {IVisualElement}
		 */
		public getElementAt(index:number):IVisualElement{
			this.checkForRangeError(index);
			return this._elementsContent[index];
		}
		
		private checkForRangeError(index:number, addingElement:boolean = false):void{
			var maxIndex:number = this._elementsContent.length - 1;
			
			if (addingElement)
				maxIndex++;
			
			if (index < 0 || index > maxIndex)
				throw new RangeError("索引:\""+index+"\"超出可视元素索引范围");
		}
		/**
		 * @method ns_egret.Skin#addElement
		 * @param element {IVisualElement} 
		 * @returns {IVisualElement}
		 */
		public addElement(element:IVisualElement):IVisualElement{
			var index:number = this.numElements;
			
			if (element.owner == this)
				index = this.numElements-1;
			
			return this.addElementAt(element, index);
		}
		/**
		 * @method ns_egret.Skin#addElementAt
		 * @param element {IVisualElement} 
		 * @param index {number} 
		 * @returns {IVisualElement}
		 */
		public addElementAt(element:IVisualElement, index:number):IVisualElement{
			this.checkForRangeError(index, true);
			
			var host:any = element.owner; 
			if (host == this){
				this.setElementIndex(element, index);
				return element;
			}
			else if (element.parent&&"removeElement" in element.parent){
				(<IVisualElementContainer><any> (element.parent)).removeElement(element);
			}
			else if(host&&"removeElement" in host){
				(<IContainer><any> host).removeElement(element);
			}
			
			this._elementsContent.splice(index, 0, element);
			
			if(this._hostComponent)
				this._elementAdded(element, index);
			
			return element;
		}
		/**
		 * @method ns_egret.Skin#removeElement
		 * @param element {IVisualElement} 
		 * @returns {IVisualElement}
		 */
		public removeElement(element:IVisualElement):IVisualElement{
			return this.removeElementAt(this.getElementIndex(element));
		}
		/**
		 * @method ns_egret.Skin#removeElementAt
		 * @param index {number} 
		 * @returns {IVisualElement}
		 */
		public removeElementAt(index:number):IVisualElement{
			this.checkForRangeError(index);
			
			var element:IVisualElement = this._elementsContent[index];
			
			if(this._hostComponent)
				this._elementRemoved(element, index);
			
			this._elementsContent.splice(index, 1);
			
			return element;
		}
			
		/**
		 * @method ns_egret.Skin#getElementIndex
		 * @param element {IVisualElement} 
		 * @returns {number}
		 */
		public getElementIndex(element:IVisualElement):number{
			return this._elementsContent.indexOf(element);
		}
		/**
		 * @method ns_egret.Skin#setElementIndex
		 * @param element {IVisualElement} 
		 * @param index {number} 
		 */
		public setElementIndex(element:IVisualElement, index:number):void{
			this.checkForRangeError(index);
			
			var oldIndex:number = this.getElementIndex(element);
			if (oldIndex==-1||oldIndex == index)
				return;
			
			if(this._hostComponent)
				this._elementRemoved(element, oldIndex, false);
			
			this._elementsContent.splice(oldIndex, 1);
			this._elementsContent.splice(index, 0, element);
			
			if(this._hostComponent)
				this._elementAdded(element, index, false);
		}
		
		/**
		 * 添加一个显示元素到容器
		 * @method ns_egret.Skin#_elementAdded
		 * @param element {IVisualElement} 
		 * @param index {number} 
		 * @param notifyListeners {boolean} 
		 */		
		public _elementAdded(element:IVisualElement, index:number, notifyListeners:boolean = true):void{
			element.ownerChanged(this);
            if(element instanceof DisplayObject){
                var childDO:DisplayObject = <DisplayObject><any> element;
                this._hostComponent._addToDisplayListAt(childDO,index,notifyListeners);
            }

			if (notifyListeners){
				if (this.hasEventListener(ElementExistenceEvent.ELEMENT_ADD))
                    ElementExistenceEvent.dispatchElementExistenceEvent(this,
                        ElementExistenceEvent.ELEMENT_ADD,element,index);
			}
			
			this._hostComponent.invalidateSize();
			this._hostComponent.invalidateDisplayList();
		}
		/**
		 * 从容器移除一个显示元素
		 * @method ns_egret.Skin#_elementRemoved
		 * @param element {IVisualElement} 
		 * @param index {number} 
		 * @param notifyListeners {boolean} 
		 */		
		public _elementRemoved(element:IVisualElement, index:number, notifyListeners:boolean = true):void{
			if (notifyListeners){        
				if (this.hasEventListener(ElementExistenceEvent.ELEMENT_REMOVE))
                    ElementExistenceEvent.dispatchElementExistenceEvent(this,
                        ElementExistenceEvent.ELEMENT_REMOVE,element,index);
			}

            if(element instanceof DisplayObject&&element.parent==this._hostComponent){
                var childDO:DisplayObject = <DisplayObject><any> element;
                this._hostComponent._removeFromDisplayList(childDO,notifyListeners);
            }

			element.ownerChanged(null);
			this._hostComponent.invalidateSize();
			this._hostComponent.invalidateDisplayList();
		}

        //========================state相关函数===============start=========================

        private _states:Array<any> = [];
        /**
         * 为此组件定义的视图状态。
         * @member ns_egret.StateClientHelper#states
         */
        public get states():Array<any>{
            return this._states;
        }
        public set states(value:Array<any>){
            this._setStates(value);
        }

        public _setStates(value:Array<any>){
            if(!value)
                value = [];
            if(typeof(value[0]) == "string"){
                var length:number = value.length;
                for(var i:number=0;i<length;i++){
                    var state:State = new State();
                    state.name = value[i];
                    value[i] = state;
                }
            }

            this._states = value;
            this.currentStateChanged = true;
            this.requestedCurrentState = this._currentState;
            if(!this.hasState(this.requestedCurrentState)){
                this.requestedCurrentState = this.getDefaultState();
            }
        }

        /**
         * 当前视图状态发生改变的标志
         */
        private currentStateChanged:boolean;

        private _currentState:string;
        /**
         * 存储还未验证的视图状态
         */
        private requestedCurrentState:string;
        /**
         * 组件的当前视图状态。将其设置为 "" 或 null 可将组件重置回其基本状态。
         * @member ns_egret.StateClientHelper#currentState
         */
        public get currentState():string{
            if(this.currentStateChanged)
                return this.requestedCurrentState;
            return this._currentState?this._currentState:this.getDefaultState();
        }

        public set currentState(value:string){
            if(!value)
                value = this.getDefaultState();
            if (value != this.currentState &&value&&this.currentState){
                this.requestedCurrentState = value;
                this.currentStateChanged = true;
                if (this._hostComponent){
                    this.commitCurrentState();
                }
            }
        }

        /**
         * 返回是否含有指定名称的视图状态
         * @method ns_egret.Skin#hasState
         * @param stateName {string}
         * @returns {boolean}
         */
        public hasState(stateName:string):boolean{
            return (this.getState(stateName) != null);
        }

        /**
         * 返回默认状态
         */
        private getDefaultState():string{
            if(this._states.length>0){
                return this._states[0].name;
            }
            return null;
        }
        /**
         * 应用当前的视图状态。子类覆盖此方法在视图状态发生改变时执行相应更新操作。
         * @method ns_egret.Skin#commitCurrentState
         */
        public commitCurrentState():void{
            if(!this.currentStateChanged)
                return;
            this.currentStateChanged = false;
            var destination:State = this.getState(this.requestedCurrentState);
            if(!destination){
                this.requestedCurrentState = this.getDefaultState();
            }
            var oldState:string = this._currentState ? this._currentState : "";
            if (this.hasEventListener(StateChangeEvent.CURRENT_STATE_CHANGING)) {
                StateChangeEvent.dispatchStateChangeEvent(this,
                    StateChangeEvent.CURRENT_STATE_CHANGING,oldState,
                    this.requestedCurrentState ? this.requestedCurrentState : "");
            }

            this.removeState(this._currentState);
            this._currentState = this.requestedCurrentState;

            if (this._currentState) {
                this.applyState(this._currentState);
            }

            if (this.hasEventListener(StateChangeEvent.CURRENT_STATE_CHANGE)){
                StateChangeEvent.dispatchStateChangeEvent(this,StateChangeEvent.CURRENT_STATE_CHANGE,oldState,
                    this._currentState ? this._currentState : "")
            }
        }


        /**
         * 通过名称返回视图状态
         */
        private getState(stateName:string):State{
            if (!stateName)
                return null;
            var states:Array<any> = this._states;
            var length:number = states.length;
            for (var i:number = 0; i < length; i++){
                var state:State = states[i];
                if (state.name == stateName)
                    return state;
            }
            return null;
        }

        /**
         * 移除指定的视图状态以及所依赖的所有父级状态，除了与新状态的共同状态外
         */
        private removeState(stateName:string):void{
            var state:State = this.getState(stateName);
            if (state){
                var overrides:Array<any> = state.overrides;
                for (var i:number = overrides.length-1; i>=0; i--)
                    overrides[i].remove(this);
            }
        }

        /**
         * 应用新状态
         */
        private applyState(stateName:string):void{
            var state:State = this.getState(stateName);
            if (state){
                var overrides:Array<any> = state.overrides;
                var length:number = overrides.length;
                for (var i:number = 0; i < length; i++)
                    overrides[i].apply(<IContainer><any>(this));
            }
        }

        private initialized:boolean = false;
        /**
         * 初始化所有视图状态
         * @method ns_egret.StateClientHelper#initializeStates
         */
        public initializeStates():void{
            if(this.initialized)
                return;
            this.initialized = true;
            var states:Array<any> = this._states;
            var length:number = states.length;
            for (var i:number = 0; i < length; i++){
                var state:State = <State> (states[i]);
                state.initialize(this);
            }
        }
        //========================state相关函数===============end=========================
	}
}
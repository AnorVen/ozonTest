'use strict';
$("#slider").rangeSlider({
  bounds: {min: 52, max: 400},
  defaultValues: {min: 80, max: 200}
});

class Container {
  Constructor() {
    this.id = '';
    this.className = '';
    this.htmlCode = '';

  }
  render() {
    return this.htmlCode;
  }
}

class SearchSelectList extends Container {
  Constructor(my_id, my_class) {
    this.id = my_id;
    this.className = my_class;
    this.items = [];
    this.ajax();
  }

  render() {
    let result = '<ul class="' + this.className + '" id="' + this.id + '">';
    let items = this.items;
    items.forEach(function (item) {
      result += '<li class="' + item.class + '" data-value=' + item.data + ' >' + item.name + '</li>';
    });
    /* for( let i = 0, i < this.items.length; i++){
       result += i
     }*/

    result += '</ul>';
    return result;
  }

  ajax() {
    $.ajax({
      url: './js/json/search.json',
      dataType: 'json',
      async: false,
      success: function (data) {
        this.id = data.list.id;
        this.className = data.list.class;
        let a = [];
        for (let i = 0; i < data.menuItems.length; i++) {
          a.push(data.menuItems[i]);

        }
        this.items = a;
        /*
        for(let index in data.menuItems) {
          this.items.push(index)
        }
*/
        this.render();
      },
      context: this
    });
  }
}

class Basket extends Container {
  Constructor() {
    this.countGoods = 0;
    this.amount = 0;
    this.basketItems = [];
  }

  collectBasketItems(root) {
    $.get({
      url: './js/json/basket.json',
      dataType: 'json',
      success: function (data) {
        let quantity = 0;
        let b = function () {

          for (let i = 0; i < data.basket.length; i++) {
            quantity += +data.basket[i]['quantity'];
          }
          return quantity;

        };
        this.countGoods = b();

        this.amount = data.amount;

        let a = [];
        for (let i = 0; i < data.basket.length; i++) {
          a.push(data.basket[i]);

        }
        this.basketItems = a;
// по непонятной причине for.. in не проходит.
        /*
        for (let index in data.basket) {
          console.log(data.basket[index]);
          this.basketItems.push(data.basket[index]);
        }
*/
        this.render(root);
        this.refresh();
      },
      context: this
    });
  }

  render() {
    let basketDiv = $('#card__menu');

    let basketItemsDiv = $('<div />', {
      id: 'purchase__list',
      class: 'purchase__list'
    });

    let basketData = $('<div />', {
      id: 'basket_data',
      class: 'card__total-price total-price'
    });

    let basketLink = $('<div />', {
      class: 'card__link',
      id: 'card__link'
    });

    basketDiv.empty();
    basketDiv.append(basketItemsDiv);
    basketDiv.append(basketData);
    basketDiv.append(basketLink);
    basketLink.append('<div class="card__checkout"><a href="#">Checkout</a></div><div class="card__go-to-card"><a href="#">Go to card</a></div>');

  };

  refresh() {
    let $basketItemsDiv = $('#purchase__list');
    $basketItemsDiv.empty();


    for (let i = 0; i < this.basketItems.length; i++) {
      $basketItemsDiv.append(
        '<div class="purchase__item" id="purchase__item-' + i + '"><div class="purchase__img"><img src="'
        + this.basketItems[i]["src"]
        + '"></div><div class="purchase__info"><p class="purchase__title">'
        + this.basketItems[i]["title"] + '</p>'
        + '<div id="purchase__reiting' + i + '" class="purchase__reiting"></div>'
        + '<span class="purchase__price">'
        + this.basketItems[i]['quantity']
        + ' x $' + this.basketItems[i]['price']
        + '</span></div><div class="purchase__delite" id="basketItemDel-' + i + '">'
        + '<i class="fa fa-times-circle " aria-hidden="true"></i>' +
        '</div></div>');

      for (let j = 0; j < this.basketItems[i]['stars']; j++) {
        let star = $('<i />', {
          class: "fa fa-star",
          ariaHidden: 'true'
        });
        $("#purchase__reiting" + i).append(star);
      }

    }

    let $basketDataDiv = $('#basket_data');
    $basketDataDiv.empty();
    $basketDataDiv.append('<p class="total-price__text">Всего товаров: ' + this.countGoods + '</p>');
    $basketDataDiv.append('<p class="total-price__price">Сумма: ' + Math.round(this.amount*100)/100 + '</p>');


    let deleteItem = this.delete.bind(this);
    $('.purchase__item').on('click', '.purchase__delite', function () {
      let item = $(this).attr('id').split('-')[1];
      deleteItem(item);
      });
      $('.card__img--text').text(this.countGoods);



  };

  delete(item) {
    let itemToDelete = this.basketItems[item];
    this.countGoods -= itemToDelete['quantity'];
    this.amount -= itemToDelete['price'] * itemToDelete['quantity'];

    this.basketItems.splice(item, 1);
    this.refresh();

  };

  add(product, quantity, price, src, title, stars) {
    // console.log(product, quantity, price);
    let basketItems = {
      "id_product": product,
      "price": price,
      "src": src,
      "title": title,
      "quantity": quantity,
      "stars": stars

    };

////////////////////////////////////////
    //попытался сделать проверку на наличие в корзине товара с таким же id, но кажется запутался..
    // по идее нужно проверить все this.basketItems[j].id_product на наличие данного id.. и кажется это надо делать не через for а через for in..
    /*
    for( let j = 0; j < this.basketItems.length; j++){
      if(basketItems.id_product == this.basketItems[j].id_product ){

        this.basketItems[j].quantity +=quantity;
        this.countGoods++;
        this.amount += +price;

      } else{
        for (let i = 1; i <= quantity; i++) {
          this.basketItems.push(basketItems);
          this.countGoods++;
          this.amount += +price*quantity;
        }
      }

*/
    for (let i = 1; i <= quantity; i++) {
      this.basketItems.push(basketItems);
      this.countGoods++;
      this.amount += +price * quantity;
    }
    this.refresh();
  };

}


class HeaderMenu extends Container{
    Constructor(my_id, my_class) {
      this.id = my_id;
      this.className = my_class;
      this.items = [];
      this.ajax();
    }
    ajax(){
      $.ajax({
        url: './js/json/headerMenu.json',
        dataType: 'json',
        async: false,
        success: function (data) {
          this.id = data.list.id;
          this.className = data.list.class;
          let a = [];
          for (let i = 0; i < data.menuItems.length; i++) {
            a.push(data.menuItems[i]);

          }
          this.items = a;
          this.renderHeaderMenu();
        },
        context: this
      });
    }
  renderHeaderMenu() {
    let result = '<ul class="'+this.className+'" id="'+this.id+'">';
  //   for (let item in this.items) {
    let a = [];
    for (let i = 0; i < this.items.length; i++) {
      let itemMenu = '<li class="' + this.items[i].class + '"><a href="' + this.items[i].link + '">' +
        this.items[i].title + '</a>';

      if (this.items[i].submenu) {
      let submenu = '<div class="sub-nav">';
     // console.log(this.items[i].submenu);

        let submenuCol = '';
       for (let j = 0; j < this.items[i].submenu.length; j++) {

         //    for (let m in this.items[i].submenu) {

   //     console.log(this.items[i].submenu[j]);

         if(j === 0){
           submenuCol = '<div class="' + this.items[i].submenu[j].class + '"><span>' +
             this.items[i].submenu[j].title + '</span></div>';


         }else{
           $('.sub-nav__item--category').append( '<div class="' + this.items[i].submenu[j].class + '">' +
             '<a href="' + this.items[i].submenu[j].link + '">'
             + this.items[i].submenu[j].title + '</a></div>');
         }





         submenu += submenuCol
      }

      submenu += '</div>';
      itemMenu += submenu;

    }

      itemMenu += '</li>';

      result += itemMenu;
    }
    result += '</ul>';
    let nav = $('.header__nav');
    nav.empty();
    nav.append(result);

  }





}


/*
class SubMenu extends HeaderMenu{

  Constructor(my_id, my_class, this.items){
    super(this.items);
    this.className = my_class;
  }
  render() {
    return '<li>' + Menu.render.call(this) + '</li>';
  }
}

class MenuItem extends HeaderMenu{
  Constructor(my_href, my_name, my_class){
    this.className = my_class;
    this.href = my_href;
    this.name = my_name;
  }

  render() {
    return '<li class="'+this.className+'"><a href="'+this.href+'">'+this.title+'</a></li>';
  }
}
*/





class Products extends Container{
  Constructor(my_id, my_class) {
    this.id = my_id;
    this.className = my_class;
    this.items = [];
    this.ajax();
  }

  render() {


    /*
   let items =  this.items;
   items.forEach(function (item) {
     result.append('<img src="' + item.src +  '" alt="' + item.title + '" class="product__img" width="261" height="280"> <a href="#" class="product__link"><p class="product__text">' + item.title + '</p></a>' +
       '<p class="product__price">$' + item.price + '</p> ' +
       ' <div class="product__shadow"><button class="product__btn" id="id_product-' + item.id_item +'">'+
       '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24">' +
       '<defs><style> .cls-1 {fill: #fff; stroke: #fff; stroke-linejoin: round; stroke-width: 0px;' +
       'fill-rule: evenodd;}</style>\</defs><path id="Forma_1_copy" data-name="Forma 1 copy" class="cls-1"' + ' d="M898.851,2004.79h2.438l3.474,13.25a0.862,0.862,0,0,0,.823.65h10.676a0.852,0.852,0,0,0,.78-0.54l3.885-9.41a0.941,0.941,0,0,0-.071-0.85,0.827,0.827,0,0,0-.709-0.41h-11.8a0.9,0.9,0,0,0,0,1.8h10.492l-3.148,7.62h-9.471l-3.474-13.24a0.86,0.86,0,0,0-.822-0.66h-3.077A0.9,0.9,0,0,0,898.851,2004.79Zm5.926,20.21a2.038,2.038,0,1,0-1.928-2.03A1.983,1.983,0,0,0,904.777,2025Zm12.053,0h0.141a1.865,1.865,0,0,0,1.319-.7,2.117,2.117,0,0,0,.468-1.48,1.976,1.976,0,0,0-2.056-1.89,2.015,2.015,0,0,0-1.787,2.17A1.982,1.982,0,0,0,916.83,2025Z" transform="translate(-897 -2002)"/></svg>' +
     'Add to Cart</button></div>');
});

 */
    let result = $('.product');
    result.empty();
    if(!result.hasClass('product__list')){
      result.addClass('product__list')
    }



    for(let j = 0; j < this.items.length; j++){
      let product__item = $('<div />',{
        class: 'product__item'
      });

      product__item.append('<img src="' + this.items[j].src +  '" alt="' + this.items[j].title + '" class="product__img" width="261" height="280"> <a href="#" class="product__link"><p class="product__text">' + this.items[j].title + '</p></a>' +
       '<p class="product__price">$' + this.items[j].price + '</p> ' +
       ' <div class="product__shadow"><button class="product__btn" id="id_product-' + this.items[j].id_item +'">'+
       '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24">' +
       '<defs><style> .cls-1 {fill: #fff; stroke: #fff; stroke-linejoin: round; stroke-width: 0px;' +
       'fill-rule: evenodd;}</style>\</defs><path id="Forma_1_copy" data-name="Forma 1 copy" class="cls-1"' + ' d="M898.851,2004.79h2.438l3.474,13.25a0.862,0.862,0,0,0,.823.65h10.676a0.852,0.852,0,0,0,.78-0.54l3.885-9.41a0.941,0.941,0,0,0-.071-0.85,0.827,0.827,0,0,0-.709-0.41h-11.8a0.9,0.9,0,0,0,0,1.8h10.492l-3.148,7.62h-9.471l-3.474-13.24a0.86,0.86,0,0,0-.822-0.66h-3.077A0.9,0.9,0,0,0,898.851,2004.79Zm5.926,20.21a2.038,2.038,0,1,0-1.928-2.03A1.983,1.983,0,0,0,904.777,2025Zm12.053,0h0.141a1.865,1.865,0,0,0,1.319-.7,2.117,2.117,0,0,0,.468-1.48,1.976,1.976,0,0,0-2.056-1.89,2.015,2.015,0,0,0-1.787,2.17A1.982,1.982,0,0,0,916.83,2025Z" transform="translate(-897 -2002)"/></svg>' +
       'Add to Cart</button></div>');

      result.append(product__item);

    }
    return result;


  }

  ajax() {
    $.ajax({
      url: './js/json/items.json',
      dataType: 'json',
      async: false,
      success: function (data) {
        this.id = data.list.id;
        this.className = data.list.class;
        let a = [];
        for (let i = 0; i < data.items.length; i++) {
          a.push(data.items[i]);

        }
        this.items = a;
        /*
        for(let index in data.menuItems) {
          this.items.push(index)
        }
*/
        this.render();
      },
      context: this
    });
  }

}




$(document).ready(function () {
  let searchList = new SearchSelectList();
  searchList.ajax();
  $('.search-select').append(searchList.render());


  let items = new Products();
  items.ajax();

  let headerMenu = new HeaderMenu();
  headerMenu.ajax();
 // ;






  let basket = new Basket();
  $('.card__menu').append(basket.collectBasketItems());

  $('.product__btn').on('click', function () {
    let idProduct = parseInt($(this).attr('id').split('-')[1]);
    let price = parseFloat($(this).parents('.product__item').find('.product__price').text()
      .replace(/[^\d.]/g,""));
    let src = $(this).parents('.product__item').find('.product__img').attr('src');
    let title = $(this).parents('.product__item').find('.product__text').text();
    let stars =  parseInt($(this).attr('data-stars')) || 5;
    let quantity = 1;


   basket.add(idProduct, quantity, price, src, title, stars)
    // console.log(idProduct, quantity, price, src, title, stars);

  });


  $('#search-select__list li').on('click', function () {
    $('#search__select option').attr('value', this.innerHTML).text(this.innerHTML);
  });


  //slider

  /* let img = document.querySelector('.slider__wrap');
   console.log(img);
   let slider = ['','./img/2.jpg','./img/3.jpg','./img/4.jpg','./img/banner.jpg'];
   let start = slider[4];
  let slideInterval = setInterval(nextSlide,200;
 /*let i = 0;
   function nextSlide() {


     if(i < 5){
       img.style('backgroundImage') = slider[i];
       console.log(i);
       i++;
     } else{
       i = 0;

     }

   }

 */




});
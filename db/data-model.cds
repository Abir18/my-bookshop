namespace my.bookshop;
using {  managed } from '@sap/cds/common';

entity Books {
  key ID : Integer;
  title  : localized String;
  author : Association to Authors;
  stock  : Integer;
}

entity Authors {
  key ID : Integer;
  name   : String;
  books  : Association to many Books on books.author = $self;
}

entity Orders : managed {
  key ID  : UUID;
  book    : Association to Books;
  country : String;
  amount  : Integer;
}

entity Products: managed {
  key ID : UUID;
  customerName: String;
  address: String;
  delivered: Boolean;
}

entity Customers: managed {
  key OrderId : String;
  CustomerName: String;
  City: String;
  Country: String;
  Date: String;
  Delivered: Boolean;
}

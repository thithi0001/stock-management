insert into roles (role_name) values ("manager");
insert into roles (role_name) values ("storekeeper");
insert into roles (role_name) values ("import staff");
insert into roles (role_name) values ("export staff");

insert into user_accounts (username, user_password, full_name, phone, email, role_id)
values ("quanlykho","$2b$10$geyKyU.yAy3gaRHqDfCIo.cbW8QoM.9P7KsoWsGYbRQFsO75GJKK.","Nguyễn Thị H","0911111111","quanlykho01@gmail.com",1);
insert into user_accounts (username, user_password, full_name, phone, email, role_id)
values ("thukho","$2b$10$1kacTDXENjTr50u.NrkV4ulKSgymOHqccHX4YzhqFaSnRq.xe3IoO","Lê Văn A","0123456789","thukho01@gmail.com",2);
insert into user_accounts (username, user_password, full_name, phone, email, role_id)
values ("nvmh","$10$NM.aeW/5YgqL4e6mMRybN.PMPL5Dx7krmghnr7/cxqhHBo5tUPw6S","Trần Văn B","0836668386","nvmh01@gmail.com",3);
insert into user_accounts (username, user_password, full_name, phone, email, role_id)
values ("nvbh","$2b$10$tqy7MzUdn5kK.V05vHBqn.lCzsZpRVk/adJOxIsXOwua3PAJWvpTG","Hoàng Văn C","0919555999","nvbh01@gmail.com",4);
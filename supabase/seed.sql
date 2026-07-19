-- Development only. Run manually after the initial migration.
with c as (select id,slug from public.categories)
insert into public.products(category_id,name,slug,short_description,status,featured,seo_title,meta_description)
select id,'Булчинска рокля Белла','bulchinska-roklya-bella','Елегантен силует с фин дантелен детайл.','published',true,'Булчинска рокля Белла','Разгледайте модел Белла в бутик Емоция.' from c where slug='bulchinski-rokli'
union all select id,'Булчинска рокля Лилия','bulchinska-roklya-liliya','Нежна рокля с изчистена линия.','published',false,'Булчинска рокля Лилия','Булчински модел Лилия от Емоция.' from c where slug='bulchinski-rokli'
union all select id,'Булчинска рокля Адел','bulchinska-roklya-adel','Модел в подготовка.','draft',false,null,null from c where slug='bulchinski-rokli'
union all select id,'Официална рокля Нора','ofitsialna-roklya-nora','Дълга официална рокля.','published',true,'Официална рокля Нора','Официална рокля Нора от Емоция.' from c where slug='ofitsialni-rokli'
union all select id,'Официална рокля Ива','ofitsialna-roklya-iva','Изчистен модел за специален повод.','draft',false,null,null from c where slug='ofitsialni-rokli'
union all select id,'Булчински воал Перла','bulchinski-voal-perla','Фин воал с перлени детайли.','published',false,'Булчински воал Перла','Булчински аксесоар от Емоция.' from c where slug='aksesoari'
union all select id,'Фиба Кристал','fiba-kristal','Деликатен аксесоар за коса.','draft',false,null,null from c where slug='aksesoari';


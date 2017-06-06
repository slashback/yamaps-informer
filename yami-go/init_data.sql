drop table durations;
drop table chart_routes;
drop table routes;
drop table charts;

CREATE TABLE routes
    (
        uid serial primary key,
        name character varying(100) NOT NULL,
        description character varying(100) NOT NULL,
        waypoints text
    )
    WITH (OIDS=FALSE);

CREATE TABLE durations
    (
        uid serial primary key,
        route_id integer references routes(uid),
        duration integer NOT NULL,
        check_time timestamp
    )
    WITH (OIDS=FALSE);


    CREATE TABLE charts
    (
	uid serial primary key,
	name text
    );
    insert into charts (name) values
    ('Main Chart');

    CREATE TABLE chart_routes
    (
	chart_id integer references charts(uid),
	route_id integer references routes(uid)
    );
/*    
insert into chart_routes (chart_id, route_id) values 
    (1,1),
    (1,2),
    (1,3),
    (1,4),
    (1,5),
    (1,6),
    (1,7),
    (1,8),
    (1,9);

*/
  /*insert into routes (name, waypoints) values
  ('bor', array['51.33', '15.32']),
  ('yar', array['11.33', '12.32']);

  insert into route_items (route_id, duration, check_time) values 
  (1, '55', '2016-06-22 19:10:25-07'),
  (1, '55', '2016-06-22 19:15:25-07'),
  (2, '55', '2016-06-22 19:10:25-07'),
  (2, '55', '2016-06-22 19:15:25-07')
  */

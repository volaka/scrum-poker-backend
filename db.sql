--Create sprint table
CREATE TABLE public.sprint (
    id integer NOT NULL,
    name text NOT NULL,
    vote_count smallint NOT NULL,
    dev_link text NOT NULL
);

CREATE SEQUENCE public.sprint_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.sprint_id_seq OWNED BY public.sprint.id;

ALTER TABLE ONLY public.sprint ALTER COLUMN id SET DEFAULT nextval('public.sprint_id_seq'::regclass);

ALTER TABLE ONLY public.sprint
    ADD CONSTRAINT sprint_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX name ON public.sprint USING btree (name);

-- Create story table
CREATE TABLE public.story (
    id integer NOT NULL,
    name text NOT NULL,
    status text NOT NULL,
    s_id integer NOT NULL,
    point smallint
);

CREATE SEQUENCE public.story_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.story_id_seq OWNED BY public.story.id;

ALTER TABLE ONLY public.story ALTER COLUMN id SET DEFAULT nextval('public.story_id_seq'::regclass);

ALTER TABLE ONLY public.story
    ADD CONSTRAINT story_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.story
    ADD CONSTRAINT fk_sprint_id FOREIGN KEY (s_id) REFERENCES public.sprint(id);

-- Create vote table
CREATE TABLE public.vote (
    id integer NOT NULL,
    s_id integer NOT NULL,
    point smallint NOT NULL,
    voter smallint NOT NULL
);

CREATE SEQUENCE public.vote_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.vote_id_seq OWNED BY public.vote.id;

ALTER TABLE ONLY public.vote ALTER COLUMN id SET DEFAULT nextval('public.vote_id_seq'::regclass);

ALTER TABLE ONLY public.vote
    ADD CONSTRAINT vote_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.vote
    ADD CONSTRAINT fk_strory_id FOREIGN KEY (s_id) REFERENCES public.story(id);
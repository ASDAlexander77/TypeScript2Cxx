enum e1 {
	v1, v2
};

const e = e1.v1;
switch (e)
{
	case e1.v1:
	case e1.v2:
		break;
}
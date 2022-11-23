public class main
{
	public static void main(String[] args)
	{
	double i=5.0, n=3.0, a=i/n;
	int I=(int)i, N=(int)n;
	int b=I*N, c=I+N, d=I-N, e=1;
		for(int r=0;r<N;r++){
			e=I*e;
		}
	System.out.println("i/n="+a+"\ni*n="+b+"\ni+n="+c+"\ni-n="+d+"\ni^n="+e);
	}
}

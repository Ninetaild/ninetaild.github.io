class Parents{
	double a=10.0, b=5.0;
}
class Child extends Parents{
	int A=(int)a, B=(int)b;
	public void sum(){
		System.out.println("a+b="+(A+B));
	}
	public void min(){
		System.out.println("a-b="+(A-B));
	}
	public void div(){
		System.out.println("a/b="+(a/b));
	}
	public void mu(){
		System.out.println("a*b="+(A*B));
	}
	public void dou(){
		int n=1;
		for(int i=0;i<B;i++){
			n=n*A;
		}
		System.out.println("a^b="+n);
	}
}
public class Main {
	public static void main(String[] args) {
		Child ch=new Child();
		ch.sum();
		ch.min();
		ch.div();
		ch.mu();
		ch.dou();
	}
}

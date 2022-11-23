class SubClass1{
    double a=10.0;
    double b=5.0;
}
class SubClass2 extends SubClass1{
    int A=(int)a, B=(int)b, n=1;
    public void sum(){
        System.out.println("a+b="+(A+B));
    }
    public void subtract(){
        System.out.println("a-b="+(A-B));
    }
    public void mul(){
        System.out.println("a*b="+(A*B));
    }
    public void div(){
    System.out.println("a/b="+(a/b));
    }
    public void dou(){
        for(int i=0;r<B;i++){
            n=A*n;
        }
    }
}
public class MainClass{
    public static void main(string[] args){
        SubClass sub=new SubClass();
        sub.set(a);
        sub.set(b);
        sub.sum();
        sub.subtract();
        sub.mul();
        sub.div();
        sub.dou();
    }
}

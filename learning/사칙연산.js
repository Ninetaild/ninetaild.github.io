import java.util.scanner;
class ThisClass{
    public void Set1(double a){
        this.a=a;
    }
    public void Set2(double b){
        this.b=b;
    }
}
class SubClass extends ThisClass{
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
public class Result{
    public static void main(string[] args){
        System.out.println("2개의 정수 입력");
        Scanner sc=new Scanner(System.in);
        double a = sc.nextDouble();
        double b = sc.nextDouble();
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

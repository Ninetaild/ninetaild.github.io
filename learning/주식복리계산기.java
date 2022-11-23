package yun;
import java.util.Scanner;

public class Main {
	public static void main(String[] args) {
			Scanner sc=new Scanner(System.in);
			System.out.println("년수");
			double 년수=sc.nextInt();
			System.out.println("성장률");
			double 성장률=sc.nextInt();
			System.out.println("원금");
			double 원금=sc.nextInt();
			System.out.println("적립금");
			double 적립금=sc.nextInt();
			sc.close();
			
			double sum=0.00, avr=성장률/100, add=적립금;
			for(int i=0;i<년수;i++){
				원금=원금*(1+avr);
			}
			double [] array=new double[100];
			for(double r=년수;r>0;r--) {
				int v=0;
				for(int i=0;i<r;i++){
					적립금=적립금*(1+avr);
				}
				array[v]=적립금;
				sum=sum+array[v];
				v=+v;
				년수=-년수;
				적립금=add;
			}
			System.out.println(String.format("%.0f", (원금+sum)));
	}
}

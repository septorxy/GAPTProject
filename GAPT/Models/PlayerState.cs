namespace GAPT.Models
{
    public class PlayerState
    {
        
        public double x{ get; set; }
        public double y { get; set; }  
        public string name { get; set; }
        public int speed { get; set; }
        public bool boole { get; set; }
        public string direction { get; set; }
        //public object anims { get; set; }


        public PlayerState(int x, int y, string name, int speed, bool boole, string direction/*, object anims*/)
        {
            this.name = name;
            this.x = x;
            this.y = y;
            this.speed = speed;
            this.boole = boole;
            this.direction = direction;
            //this.anims = anims;
        }
        
    }
}


package uk.ac.nactem.covid.netvis;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Collection;
import java.util.Set;

/**
 *
 * @author sam
 */
@JsonAutoDetect(fieldVisibility=JsonAutoDetect.Visibility.NONE,
        getterVisibility=JsonAutoDetect.Visibility.NONE,
        isGetterVisibility=JsonAutoDetect.Visibility.NONE,
        setterVisibility=JsonAutoDetect.Visibility.NONE)
public interface NetworkVisDataProvider extends java.io.Serializable {

    @JsonAutoDetect(fieldVisibility=JsonAutoDetect.Visibility.NONE,
        getterVisibility=JsonAutoDetect.Visibility.NONE,
        isGetterVisibility=JsonAutoDetect.Visibility.NONE,
        setterVisibility=JsonAutoDetect.Visibility.NONE)
   public interface Node {
       @JsonProperty("id")
       public int getId();
       @JsonProperty("group")
       public String getGroup();
       @JsonProperty("name")
       public String getLabel();
       @JsonProperty("title")
       public String getTitle();
       @JsonProperty("score")
       public Float getScore();
   }
   
    @JsonAutoDetect(fieldVisibility=JsonAutoDetect.Visibility.NONE,
        getterVisibility=JsonAutoDetect.Visibility.NONE,
        isGetterVisibility=JsonAutoDetect.Visibility.NONE,
        setterVisibility=JsonAutoDetect.Visibility.NONE)
   public interface Edge {
       @JsonProperty("id")
       public int getId();
       @JsonIgnore
       public Node getNodeA();
       @JsonIgnore
       public Node getNodeB();
       @JsonProperty("value")
       public Number getValue();
       @JsonProperty("title")
       public String getTitle();
       @JsonProperty("type")
       public Integer getType();
       @JsonProperty("directed")
       public Boolean isDirected();
       @JsonProperty("source")
       public default int getSource() {
           return getNodeA().getId();
       }
       @JsonProperty("target")
       public default int getTarget() {
           return getNodeB().getId();
       }
   }
    
   public interface EdgeType {
       @JsonProperty("id")
       public int getId();
       @JsonProperty("name")
       public String getName();
       @JsonProperty("category")
       public String getCategory();
   }
   
   @JsonProperty("nodes")
   public Collection<? extends Node> getNodes();
   @JsonProperty("edges")
   public Set<Edge> getEdges();
   @JsonProperty("edgeTypes")
   public Set<EdgeType> getEdgeTypes();
   @JsonIgnore
   public NetworkVisDataProvider expandRelations(int nodeId);
}
